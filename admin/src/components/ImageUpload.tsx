import { useState } from 'react';
import { Upload, Button, Image, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { uploadFile } from '../api/upload';

interface Props {
  value?: string;
  onChange?: (url: string) => void;
}

/** 受控图片上传字段：调用 /api/admin/uploads 得到 url 写入表单 image_url / cover_image */
export default function ImageUpload({ value, onChange }: Props) {
  const [loading, setLoading] = useState(false);

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setLoading(true);
    try {
      const res = await uploadFile(file as File);
      onChange?.(res.url);
      onSuccess?.(res);
    } catch (e) {
      message.error('图片上传失败');
      onError?.(e as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Upload
        listType="picture"
        showUploadList={false}
        customRequest={customRequest}
        accept="image/*"
        maxCount={1}
      >
        <Button icon={<UploadOutlined />} loading={loading}>
          上传图片
        </Button>
      </Upload>
      {value ? (
        <div style={{ marginTop: 8 }}>
          <Image src={value} alt="预览" style={{ maxHeight: 120, borderRadius: 8 }} />
        </div>
      ) : null}
    </div>
  );
}
