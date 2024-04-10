import { Dispatch, SetStateAction, useState } from "react";
import { Flex, Spin, Typography, Upload, UploadProps, message } from "antd";
import "./uploadimg.scss";
interface Props {
  imgDefault?: string;
  setImgFile: Dispatch<SetStateAction<any>>;
  disabled?: boolean;
}

export const UploadImg = ({ disabled = false, imgDefault = "", setImgFile }: Props) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(imgDefault);

  // eslint-disable-next-line no-unused-vars
  const getBase64 = (img: any, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result as string));
    reader.readAsDataURL(img);
    setImgFile(img);
  };
  // Validation for image, max size is 2mb
  const beforeUpload = (file: any) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) message.error("Image must smaller than 2MB!");
    return isJpgOrPng && isLt2M;
  };

  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as any, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };
  return (
    <Flex vertical className="uploadimg">
      <Upload
        name="avatar"
        listType="picture-card"
        showUploadList={false}
        action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
        beforeUpload={beforeUpload}
        onChange={handleChange}
        disabled={disabled}
      >
        {loading && <Spin />}
        {imageUrl ? (
          <img src={imageUrl} alt="avatar" style={{ width: "100%" }} />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
          >
            <path
              d="M40.5 7.5H13.5C12.7044 7.5 11.9413 7.81607 11.3787 8.37868C10.8161 8.94129 10.5 9.70435 10.5 10.5V13.5H7.5C6.70435 13.5 5.94129 13.8161 5.37868 14.3787C4.81607 14.9413 4.5 15.7044 4.5 16.5V37.5C4.5 38.2956 4.81607 39.0587 5.37868 39.6213C5.94129 40.1839 6.70435 40.5 7.5 40.5H34.5C35.2956 40.5 36.0587 40.1839 36.6213 39.6213C37.1839 39.0587 37.5 38.2956 37.5 37.5V34.5H40.5C41.2957 34.5 42.0587 34.1839 42.6213 33.6213C43.1839 33.0587 43.5 32.2956 43.5 31.5V10.5C43.5 9.70435 43.1839 8.94129 42.6213 8.37868C42.0587 7.81607 41.2957 7.5 40.5 7.5ZM13.5 10.5H40.5V22.2656L38.6119 20.3794C38.3333 20.1007 38.0025 19.8797 37.6385 19.7289C37.2745 19.5781 36.8843 19.5005 36.4903 19.5005C36.0963 19.5005 35.7061 19.5781 35.3421 19.7289C34.9781 19.8797 34.6473 20.1007 34.3688 20.3794L30.6188 24.1294L22.3688 15.8794C21.8062 15.3172 21.0434 15.0014 20.2481 15.0014C19.4528 15.0014 18.6901 15.3172 18.1275 15.8794L13.5 20.5069V10.5ZM34.5 37.5H7.5V16.5H10.5V31.5C10.5 32.2956 10.8161 33.0587 11.3787 33.6213C11.9413 34.1839 12.7044 34.5 13.5 34.5H34.5V37.5ZM40.5 31.5H13.5V24.75L20.25 18L29.5613 27.3113C29.8425 27.5923 30.2239 27.7502 30.6216 27.7502C31.0192 27.7502 31.4006 27.5923 31.6819 27.3113L36.4931 22.5L40.5 26.5088V31.5ZM30 15.75C30 15.305 30.132 14.87 30.3792 14.5C30.6264 14.13 30.9778 13.8416 31.389 13.6713C31.8001 13.501 32.2525 13.4564 32.689 13.5432C33.1254 13.63 33.5263 13.8443 33.841 14.159C34.1557 14.4737 34.37 14.8746 34.4568 15.311C34.5436 15.7475 34.499 16.1999 34.3287 16.611C34.1584 17.0222 33.87 17.3736 33.5 17.6208C33.13 17.868 32.695 18 32.25 18C31.6533 18 31.081 17.7629 30.659 17.341C30.2371 16.919 30 16.3467 30 15.75Z"
              fill="#DDDDDD"
            />
          </svg>
        )}
      </Upload>
      <Typography.Text className="uploadText">
        * Sube la imagen del logo del proyecto que vas a crear
      </Typography.Text>
    </Flex>
  );
};
