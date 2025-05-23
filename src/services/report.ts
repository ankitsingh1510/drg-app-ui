import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AssignedAppsResponse, FileExistsParams, FileInfo, FileUploadParams, SignedURLResponse } from "../interfaces/report";
import type { FileParamInfo, TokenPayload, UploadConfig, UploadProgressEvent } from "../types/report";
import type { GQLRequestParams, GQLResponse } from "../types/types";
import axios from "./axios";
import Constants from 'expo-constants';

const { EXPO_PUBLIC_BASE_URL, EXPO_PUBLIC_BASE_URL_GQL } = Constants.expoConfig.extra;
class ReportServiceClass {
    private readonly baseUrl: string;
    private readonly gqlUrl: string;
    private fileControllers: Map<string, AbortController>;
    private thumbControllers: Map<string, AbortController>;

    constructor() {
        this.baseUrl = EXPO_PUBLIC_BASE_URL;
        this.gqlUrl = EXPO_PUBLIC_BASE_URL_GQL;
        this.fileControllers = new Map();
        this.thumbControllers = new Map();
    }
    private async getGQLResponse(reqParams: GQLRequestParams): Promise<GQLResponse> {
        const token = await AsyncStorage.getItem('token');
        return axios.post(this.gqlUrl + "/graphql", reqParams, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    async getMyApplicationData(): Promise<AssignedAppsResponse> {
        try {
            const reqParams: GQLRequestParams = {
                query: "{getMyApplications{ data{assignedApps{ applicationId, name, description, iconUrl, launchUrl }, otherApps{ applicationId, name, description, iconUrl } }statusCode message} }"
            };
            const response = await this.getGQLResponse(reqParams);
            return response?.data?.data?.getMyApplications;
        } catch (error) {
            console.error("Failed to get application data:", error);
            return {
                data: {
                    assignedApps: [],
                    otherApps: [],
                },
                message: "Failed to get application data",
                statusCode: 500,
            };
        }
    }

    async checkFileExists(fileInfo: FileInfo[]): Promise<any> {
        const reqParams: GQLRequestParams = {
            query: `query checkFileExists($inputModel: JSON) {
        checkFileExists(inputModel: $inputModel)
      }`,
            variables: {
                inputModel: {
                    targetLocation: sessionStorage.getItem('targetLocation'),
                    uploadPath: `${sessionStorage.getItem('targetLocation')}DRG/`,
                    files: fileInfo,
                    folder: null,
                } as FileExistsParams,
            },
        };

        const response = await this.getGQLResponse(reqParams);
        // console.log("File exists response:", response.data);
        return response.data;
    }

    async uploadFile(param: FileUploadParams): Promise<any> {
        const controller = new AbortController();
        this.fileControllers.set(param.uniqueId, controller);

        try {
            const response = await axios.post(
                `${this.baseUrl}/api/v1/drg/rag`,
                param,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
                    },
                    signal: controller.signal,
                    onUploadProgress: (progressEvent) => {
                        const typedEvent = progressEvent as unknown as UploadProgressEvent;
                        if (typedEvent?.progress === 1) {
                            typedEvent.progress = 0.90;
                        }

                        const uploadProgress = new CustomEvent("uploadProgress", {
                            detail: {
                                ...typedEvent,
                                uniqueId: param.uniqueId,
                            },
                        });
                        dispatchEvent(uploadProgress);
                    },
                }
            );

            if (response.status === 200) {
                const uploadProgress = new CustomEvent("uploadProgress", {
                    detail: {
                        progress: 1,
                        uniqueId: param.uniqueId,
                    } as UploadProgressEvent,
                });
                dispatchEvent(uploadProgress);
                return response;
            } else {
                const message = response.data?.message || "Error uploading files";
                this.dispatchUploadFailure(param.uniqueId);
            }
        } catch (error) {
            this.dispatchUploadFailure(param.uniqueId);
            console.error("Error uploading files:", error);
        } finally {
            this.fileControllers.delete(param.uniqueId);
        }
    }

    private dispatchUploadFailure(uniqueId: string): void {
        const uploadProgress = new CustomEvent("uploadProgress", {
            detail: {
                progress: -1,
                uniqueId,
            } as UploadProgressEvent,
        });
        dispatchEvent(uploadProgress);
    }

    async getFileList(paramInfo: FileParamInfo): Promise<any> {
        const reqParams: GQLRequestParams = {
            query: `query fileList($fileAttr: JSONObject) {
        getFileList(fileAttribute: $fileAttr)
      }`,
            variables: {
                fileAttr: {
                    bucket: paramInfo.bucketName || "",
                    maxResults: paramInfo.maxResults,
                    prefix: paramInfo.prefix,
                    delimiter: paramInfo.delimiter,
                    sharedFlag: paramInfo.sharedFlag,
                    includeTrailingDelimiter: paramInfo.includeTrailingDelimiter,
                    pageToken: paramInfo.pageToken,
                },
            },
        };

        const response = await this.getGQLResponse(reqParams);
        return response.data.data.getFileList;
    }

    async getSignedURL(encodedURL: string, viewFile = false, fileType = ""): Promise<SignedURLResponse> {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error("Authentication token not found");
        }

        try {
            const response = await axios.get(
                `${this.baseUrl}/api/v1/storage/blobStoreObjects/${encodedURL}/signedUrl`,
                {
                    params: {
                        viewFile,
                        fileType: window.encodeURIComponent(fileType),
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching signed URL:", error);
            throw error;
        }
    }

    async getValidToken(credentials: TokenPayload): Promise<{ token: string }> {
        try {
            const response = await axios.post(`${this.baseUrl}/api/token`, credentials);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async cancelRequest(param: { uniqueId: string }): Promise<void> {
        try {
            const fileController = this.fileControllers.get(param.uniqueId);
            const thumbController = this.thumbControllers.get(param.uniqueId);

            if (thumbController) {
                thumbController.abort();
                this.thumbControllers.delete(param.uniqueId);
            }

            if (fileController) {
                fileController.abort();
                this.fileControllers.delete(param.uniqueId);
            }

            this.dispatchUploadFailure(param.uniqueId);
        } catch (error) {
            console.error("Failed to cancel request:", error);
        }
    }

    async getUploadConfig(): Promise<UploadConfig> {
        const reqParams: GQLRequestParams = {
            query: `query getUploadConfig { getUploadConfig }`
        };

        const response = await this.getGQLResponse(reqParams);
        return response.data.data.getUploadConfig;
    }

    async revokeToken(): Promise<any> {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No token to revoke");
        }

        try {
            return await axios.post(
                `${this.baseUrl}/api/token/revoke`,
                { token },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Failed to revoke token:", error);
            throw error;
        }
    }
}

export const ReportService = new ReportServiceClass();