export type GQLResponse = {
    config: any;
    data: any;
    status?: number;
    statusText?: string;
    headers?: any;
    request?: any;
};

export type GQLRequestParams = {
    query: string;
    variables?: Record<string, any>;
};

export type eSignature = {
    changeReasonDetail: string;
    username: string;
    password: string;
}

export type sidebarItem = {
    group?: string;
    id: string;
    title: string;
    icon?: any;
    isActive?: boolean;
    items?: {
        title: string;
        url: string;
    }[];
}