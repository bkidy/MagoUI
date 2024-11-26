import React, {useState, useEffect, lazy, Suspense} from 'react';
import {v4 as uuidv4} from 'uuid';
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Loader2, Zap, Upload, Settings} from "lucide-react";
import {Switch} from "@/components/ui/switch";
import * as Dialog from '@radix-ui/react-dialog';
import ErrorBoundary from './ErrorBoundary';

export default function Home() {
    const [userId, setUserId] = useState('');
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [modifyExisting, setModifyExisting] = useState(true);
    const [modelName, setModelName] = useState('claude-3-5-sonnet-latest');
    const [token, setToken] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        let storedUserId = localStorage.getItem('userId');
        if (!storedUserId) {
            storedUserId = uuidv4();
            localStorage.setItem('userId', storedUserId);
        }
        setUserId(storedUserId);

        const savedToken = localStorage.getItem('userToken');
        if (savedToken) {
            setToken(savedToken);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('userToken', token);
    }, [token]);

    const [DynamicGeneratedComponent, setDynamicGeneratedComponent] = useState<React.LazyExoticComponent<React.ComponentType<any>> | null>(null);

    useEffect(() => {
        if (userId) {
            import(`./components/user/${userId}.tsx`)
                .then((module) => {
                    const Component = module.default || module;
                    setDynamicGeneratedComponent(() => lazy(() => Promise.resolve({default: Component})));
                })
                .catch((error) => {
                    console.error('Failed to load component:', error);
                    // 如果加载失败，使用默认组件
                    setDynamicGeneratedComponent(() => lazy(() => import('./DefaultComponent')));
                });
        }
    }, [userId]);


    useEffect(() => {
        const handleOpenDrawer = () => {
            setIsDrawerOpen(true);
        };

        window.addEventListener('openMainDrawer', handleOpenDrawer);

        // 清理函数
        return () => {
            window.removeEventListener('openMainDrawer', handleOpenDrawer);
        };
    }, []);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setImageBase64(reader.result);
                } else {
                    console.error('Failed to read file as string');
                    // 可以在这里设置一个错误状态或显示一个错误消息
                }
            };
            reader.readAsDataURL(file);
        }
    };


    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setIsDrawerOpen(false);
        try {
            const response = await fetch('http://127.0.0.1:8000/generate_jsx', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    prompt: query,
                    image: imageBase64,
                    modify_existing: modifyExisting,
                    model: modelName,
                    user_id: userId
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // 处理 HTTP 错误
                if (response.status === 404) {
                    throw new Error('No JSX code block found in the response');
                } else if (response.status === 500) {
                    throw new Error(`Server error: ${data.detail}`);
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            if (data.success) {
                // 操作成功，重新加载页面
                window.location.reload();
            } else {
                // 服务器返回成功，但操作失败
                throw new Error(data.message || 'Operation failed for unknown reasons');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 relative">
            {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Loader2 className="h-16 w-16 animate-spin text-white"/>
                </div>
            )}

            <div className="absolute top-4 right-4 z-40">
                <Dialog.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <Dialog.Trigger asChild>
                        <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4"/>
                        </Button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50"/>
                        <Dialog.Content
                            className="fixed top-0 right-0 h-full w-80 bg-gray-800 p-6 shadow-lg focus:outline-none">
                            <div className="mt-10 space-y-4">
                                <Textarea
                                    placeholder="Enter your prompt"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="bg-gray-700 text-gray-100 border-gray-600 placeholder-gray-400 min-h-[100px]"
                                />
                                <Input
                                    type="text"
                                    placeholder="Enter model name"
                                    value={modelName}
                                    onChange={(e) => setModelName(e.target.value)}
                                    className="bg-gray-700 text-gray-100 border-gray-600 placeholder-gray-400"
                                />
                                <Input
                                    type="password"
                                    placeholder="Enter your token"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="bg-gray-700 text-gray-100 border-gray-600 placeholder-gray-400"
                                />
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="modify-existing"
                                        checked={modifyExisting}
                                        onCheckedChange={setModifyExisting}
                                    />
                                    <label htmlFor="modify-existing" className="text-sm text-gray-300">
                                        Modify existing code
                                    </label>
                                </div>
                                <label
                                    className="cursor-pointer bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center">
                                    <Upload className="mr-2 h-4 w-4"/>
                                    Upload Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                                {imageBase64 && (
                                    <p className="text-green-400">Image uploaded successfully!</p>
                                )}
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isLoading || !query.trim() || !token.trim()}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
                                >
                                    <Zap className="mr-2 h-4 w-4"/>
                                    Generate
                                </Button>
                            </div>
                            <div className="text-white text-xs text-right mt-20">
                                -- by ElliotBai
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>

            <div className="p-4">
                {error && (
                    <Alert variant="destructive" className="mb-4 bg-red-800 border-red-700 text-red-100">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div
                    className="bg-gray-800 border border-gray-700 shadow-md rounded-lg overflow-auto h-[calc(100vh-2rem)]">
                    <ErrorBoundary
                        fallback={<div className="p-4 text-white">There was an error rendering the generated component.
                            Please try again.</div>}>
                        <Suspense fallback={<div>Loading...</div>}>
                            {DynamicGeneratedComponent ? <DynamicGeneratedComponent/> : null}
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </div>
        </div>
    );
}
