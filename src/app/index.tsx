import { Link } from "expo-router";
import React, { use, useEffect } from "react";
import { Text, View, Pressable, ScrollView, Image } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import { useAuthStore } from "../store/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReportService } from "@/services/report";
import { FileItemInfo, FileParamInfo } from "@/types/report";

export default function Page() {
  const [fileList, setFileList] = React.useState<FileItemInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [noContent, setNoContent] = React.useState(false);
  const getEncodedFileURL = (localFile: any) => {
    const fileBucketUrl = localFile.id;
    const fileURL = fileBucketUrl
      .replace(localFile.bucket + '/', '')
      .replace(`${'/' + localFile.generation}`, '');
    return window.encodeURIComponent(fileURL);
  };
  const getSignedURL = async (
    file: string,
    viewFile: boolean | undefined,
    mimeType: string | undefined
  ) => {
    try {
      const res = await ReportService.getSignedURL(file, viewFile, mimeType);
      if (res) {
        return res.signedUrl;
      } else {
        throw new Error('Failed to fetch the image');
      }
    } catch (error: any) {
      console.error('Error fetching signed URL:', error);
      // showToast(error.message, 'error');
    }
  };
  const fetchFiles = async (fileListParams: FileParamInfo) => {
    try {
      console.log('Fetching files', fileListParams);
      const res = await ReportService.getFileList(fileListParams);
      if (res?.statusCode === 200) {
        if (res?.data?.data?.length) {
          setNoContent(false);

          const fileListWithSignedURL = (await Promise.all(
            res.data.data.map(async (obj: any) => {
              const encodedURL = getEncodedFileURL(obj);
              const signedURL = await getSignedURL(encodedURL, true, obj.contentType);
              setLoading(false);
              return { ...obj, signedURL: signedURL };
            })
          )) as FileItemInfo[];
          console.log('File list with signed URL:', fileListWithSignedURL);
          setFileList(fileListWithSignedURL);
        } else {
          setLoading(false);
          setNoContent(true);
          // showToast('No reports available', 'error');
        }
      } else {
        setNoContent(true);
        setLoading(false);
        const msg = 'No reports available';
        // showToast(msg, 'error');
        throw new Error(msg);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fileListParams = {
      bucket: '',
      maxResults: 200,
      // prefix: `${sessionStorage.getItem('targetLocation')}DRG/Thumbs/`,
      prefix: `indx/admin@indx.ai/DRG/Thumbs/`,
      delimiter: '/',
      sharedFlag: false,
      includeTrailingDelimiter: true,
      pageToken: null
    };
    fetchFiles(fileListParams);
  }, []);



  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">

      <View className="gap-4">
        {fileList.map((file) => (
          <Pressable
            key={file.id}
            className={`relative rounded-lg border p-2 shadow-md ${!file.hasOwnProperty('uniqueId') || file?.uniqueId === ''
              ? ''
              : 'cursor-pointer'
              }`}
            onPress={() => {
              if (!file.hasOwnProperty('uniqueId') || file?.uniqueId === '') {
                return;
              }
              // Handle card click logic here
              console.log('Card clicked:', file);
            }}
          >
            {!file.hasOwnProperty('uniqueId') || file?.uniqueId === '' ? (
              <View className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50">
                <Text className="text-gray-700 text-xs font-medium">Processing</Text>
              </View>
            ) : null}

            <View
              className={`${!file.hasOwnProperty('uniqueId') || file?.uniqueId === '' ? 'opacity-50' : ''
                }`}
            >
              <View className="flex justify-center border-b">
                <View className="w-full">
                  <Image
                    source={{ uri: file.signedURL }}
                    style={{ width: '100%', height: 200 }}
                    resizeMode="stretch"
                    onError={(e) => console.error('Image loading error:', e.nativeEvent.error)}
                  />
                </View>
              </View>

              <View className="pt-2">
                <Text
                  className="w-full truncate text-xs text-gray-500"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {file.name}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}