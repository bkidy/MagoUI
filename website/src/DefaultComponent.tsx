// import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function DefaultComponent() {
  // 由于这是一个静态组件，我们需要通过全局事件来触发主页面的抽屉
  const handleOpenDrawer = () => {
    // 发送一个自定义事件到父组件
    const event = new CustomEvent('openMainDrawer');
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-indigo-700">Welcome!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center mb-6">
            Your personalized component is not available yet. Generate a component to see it here.
          </p>
          <div className="w-24 h-24 mx-auto mb-6">
            <svg
              className="w-full h-full text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleOpenDrawer}
          >
            Generate Component
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
