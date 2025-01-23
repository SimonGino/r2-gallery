import { useCallback, useState } from 'react';
import { Theme, Text } from '@radix-ui/themes';
import { UploadIcon } from '@radix-ui/react-icons';
import { useDropzone } from 'react-dropzone';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import '@radix-ui/themes/styles.css';
import * as Toast from '@radix-ui/react-toast';
import { StreamingBlobPayloadInputTypes } from "@smithy/types";



const UploadPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (!file.type.startsWith('image/')) {
        showToast('只能上传图片文件');
        continue;
      }
      setIsUploading(true);

      try {
        // 将文件转换为ArrayBuffer
        const fileBuffer = await file.arrayBuffer() as StreamingBlobPayloadInputTypes;

        const s3Client = new S3Client({
          region: 'auto',
          endpoint: `https://${import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: import.meta.env.VITE_CLOUDFLARE_ACCESS_KEY_ID,
            secretAccessKey: import.meta.env.VITE_CLOUDFLARE_SECRET_ACCESS_KEY
          },
          forcePathStyle: true
        });

        const command = new PutObjectCommand({
          Bucket: import.meta.env.VITE_BUCKET_NAME,
          Key: file.name,
          Body: fileBuffer,
          ContentType: file.type
        });

        await s3Client.send(command);
        showToast('上传成功');
        setUploadedImage(`https://${import.meta.env.VITE_BUCKET_ENDPOINT}/${encodeURIComponent(file.name)}`);
      } catch (error) {
        console.error('上传文件时出错:', error);
        showToast('上传失败');
      }
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    }
  });

  return (
    <Theme>
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          className="bg-white rounded-lg shadow-lg p-4 items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=end]:animate-swipeOut"
          open={toastOpen}
          onOpenChange={setToastOpen}
        >
          <Toast.Description>{toastMessage}</Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-96 m-0 list-none z-50 outline-none" />
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">上传图片</h1>
            <a href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              返回浏览
            </a>
          </div>

          <div
            {...getRootProps()}
            className={`p-16 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors relative ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
          >
            <input {...getInputProps()} />
            <UploadIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-xl text-blue-500">放开以上传图片...</p>
            ) : (
              <div>
                <p className="text-xl text-gray-500 mb-2">拖放图片到这里，或点击选择图片</p>
                <p className="text-sm text-gray-400">支持的格式：JPG、JPEG、PNG、GIF、WEBP</p>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          {uploadedImage && (
            <div className="mt-8">
              <Text size="2" className="text-gray-500 mb-4">最近上传的图片：</Text>
              <div className="overflow-hidden max-w-full flex justify-center items-center">
                <img src={uploadedImage} alt="最近上传" className="max-w-full h-auto object-contain" style={{ maxHeight: '80vh' }} />
              </div>
            </div>
          )}
        </div>
      </div>
      </Toast.Provider>
    </Theme>
  );
};

export default UploadPage;