export type FileParamInfo = {
    bucketName?: string;
    maxResults: number;
    prefix: string;
    delimiter: string;
    sharedFlag: boolean;
    includeTrailingDelimiter: boolean;
    pageToken: string | null;
};

export type TokenPayload = {
    username: string;
    password: string;
};

export type UploadConfig = {
    maxFileSize: number;
    allowedExtensions: string[];
    [key: string]: any;
};

export type UploadProgressEvent = {
    progress?: number;
    uniqueId: string;
    [key: string]: any;
};

export type FileItemInfo = {
    Key: string;
    LastModified: string;
    ETag: string;
    ChecksumAlgorithm: string[];
    Size: number;
    StorageClass: string;
    name: string;
    type: string;
    id: string;
    contentType: string;
    cloudStoragePublicUrl: string;
    storageId: number;
    referenceType: string;
    referenceId: string;
    fileDataType: string;
    filePath: string;
    fileStatus: string;
    version: number;
    fileSignature: string;
    jobNumber: string | null;
    timeCreated: string;
    uploadedBy: string;
    updated: string | null;
    modifiedBy: string | null;
    originalname: string;
    encoding: string;
    mimetype: string;
    uniqueName: string;
    uploadedDate: string;
    crc32c: string;
    AcceptRanges: string;
    ContentLength: string;
    ContentType: string;
    ServerSideEncryption: string;
    uniqueId: string;
    signedURL: string;
};