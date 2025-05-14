import type { AssignedAppsResponse, FileExistsParams, FileInfo, FileUploadParams, SignedURLResponse } from "../interfaces/report";
import type { FileParamInfo, TokenPayload, UploadConfig, UploadProgressEvent } from "../types/report";
import type { GQLRequestParams, GQLResponse } from "../types/types";
import axios from "./axios";
class ReportServiceClass {
    private readonly baseUrl: string;
    private readonly gqlUrl: string;
    private fileControllers: Map<string, AbortController>;
    private thumbControllers: Map<string, AbortController>;

    constructor() {
        this.baseUrl = "https://dev.indx.ai/platform";
        this.gqlUrl = "https://dev.indx.ai/bl";
        this.fileControllers = new Map();
        this.thumbControllers = new Map();
    }
    token = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2Rldi5pbmR4LmFpL3BsYXRmb3JtIiwic3ViIjoxLCJ1c2VybmFtZSI6ImFkbWluQGluZHguYWkiLCJyb2xlX2lkIjoxLCJvcmdhbml6YXRpb25faWQiOjEsIm9yZ2FuaXphdGlvbl9uYW1lIjoiaW5keCIsInNjb3BlIjoiIiwiZm9yY2VfcGFzc3dvcmRfY2hhbmdlIjpudWxsLCJwYXNzd29yZF9leHBpcnlfZGF5cyI6bnVsbCwiZXhwIjoxNzQ3NzMzMDc1MDA4LCJpYXQiOjE3NDcxMjgyNzUwMDgsImFzc2lnbmVkQXBwbGljYXRpb25zIjpbeyJhcHBsaWNhdGlvbklkIjoxLCJuYW1lIjoiaU1hbmFnZSJ9LHsiYXBwbGljYXRpb25JZCI6MywibmFtZSI6ImlEaXNjb3ZlcnkifSx7ImFwcGxpY2F0aW9uSWQiOjUsIm5hbWUiOiJpQ2UifSx7ImFwcGxpY2F0aW9uSWQiOjIyLCJuYW1lIjoiaUtCIn0seyJhcHBsaWNhdGlvbklkIjo4LCJuYW1lIjoiaUxJTVMifSx7ImFwcGxpY2F0aW9uSWQiOjYsIm5hbWUiOiJpUE9DIn0seyJhcHBsaWNhdGlvbklkIjo0LCJuYW1lIjoiaURlc2lnbmVyIn0seyJhcHBsaWNhdGlvbklkIjo4MCwibmFtZSI6IkRyRyJ9LHsiYXBwbGljYXRpb25JZCI6NywibmFtZSI6ImlDYXJlIn0seyJhcHBsaWNhdGlvbklkIjoyMzEsIm5hbWUiOiJpQ2FyZSBWMiJ9LHsiYXBwbGljYXRpb25JZCI6MiwibmFtZSI6ImlVcGxvYWRlciJ9XSwidXNlcl90eXBlIjoibG9jYWxVc2VyIn0.sn2JyCaiF5qsJqhedWE_P_Cic3a3EW4uHU9IVjb4NgaPiB7vBqhUEuTtD87cL-i3F2-hPM-pnqRctpDiER6zXrXnsdce-dYKjZQmGdYZUleokj8kMSoFekVY8Xm-ezR4EfzcoERFBuN63PZ0-6SUCqHxlAuwN7ZJr3lWUg2vskv_Cw3Sm5BHb2y2yaTjIwxwYvix5jE5QrK59VK-uz8A5hJ6jaNdLf2zJ1_DXGe0te2VuXCZuEtc-6VBXsLqWADfZCpJfxwqVSWFU_5s28PI6Ohtt7DFFK2MhnAb07ei7tBb-nS27mjRSj4PeyJZLDw3LpJmv85H9NFyI6jNrCnR9oIg2EehRdPHhctSBzvtwWePOCZoFTmZ3GBHre3kf-1aHWh6hq4OKr-U-Nyb1F1cVtDYkR3Wn5ZSWYd3Wz-8KDsgbzzIqsMely3jXC0_dr4DE7roFkPZtFeed2c6SD_eKSulF16JbG3XEakdvotz1b0gpAcnitOWW8qDWC4ANbDwWGZHNOsfYLTCjAcJ6V6ncyeAKGiKYDtIbOy8TitH1rz5I7PbRGOdKpxGZHcnZPhEK186qeW_DBnsdo6h-GoyIfaf0P5THDmf1OzEIPOdxf_ePLaCzKlYrQMqzNrlSBaJK-twXmIs_TjDOVwjPKn-R3T-EXeBkI9X5SRjpsJMgKg`;
    private getGQLResponse(reqParams: GQLRequestParams): Promise<GQLResponse> {
        return axios.post(this.gqlUrl + "/graphql", reqParams, {
            headers: {
                Authorization: `Bearer ${this.token}`,
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
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
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
        // const token = localStorage.getItem("token");
        const token = this.token;
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