export interface FileInfo {
    fileName: string;
    selectedFile: {
        filepath: string;
    };
    fileId: string;
    size: number;
    uploadCompleted: boolean;
    filePath: string;
    traversedPath: string;
}
export interface FileUploadParams {
    uniqueId: string;
    file?: File;
    isBlocking: boolean;
    changeReasonDetail: string;
    username: string;
    password: string;
    [key: string]: any;
}

export interface FileExistsParams {
    targetLocation: string | null;
    uploadPath: string;
    files: FileInfo[];
    folder: any;
}

export interface SignedURLResponse {
    signedUrl: string;
    msg: string;
}

export interface AssignedApp {
    applicationId: number;
    name: string;
    description: string;
    iconUrl: string;
    launchUrl: string;
}

export interface AssignedAppsResponse {
    data: {
        assignedApps: AssignedApp[];
        otherApps: any[];
    };
    statusCode: number;
    message: string;
}