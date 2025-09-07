"use client"; 

import React from 'react';
import { App } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <AntdRegistry>
      <App>
        {children}
        
        {/* ToastContainer có thể đặt ở đây */}
        <ToastContainer
          position="top-center"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Slide}
        />
      </App>
    </AntdRegistry>
  );
}