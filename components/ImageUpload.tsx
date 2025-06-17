"use client";

import config from "@/lib/config";
import { IKImage, ImageKitProvider, IKUpload } from "imagekitio-next";

const authenticator = async () => {
  try {
    const response = await fetch(`${config.env.apiEndpoint}/api/auth/imageKit`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    const { signature, expire, token } = data;
  } catch (error) {
    throw new Error(`Authentication Request Fai led: ${error.message}`);
  }
};

const ImageUpload = () => {
  return <div>ImageUpload</div>;
};

export default ImageUpload;
