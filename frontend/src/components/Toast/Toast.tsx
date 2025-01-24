import { useState, useCallback } from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import { TOAST_DURATION } from '../../constants';
import { ToastViewport } from './ToastViewport';

interface ToastProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    message: string;
}

export const Toast = ({ open, onOpenChange, message }: ToastProps) => (
    <RadixToast.Provider swipeDirection="right">
        <RadixToast.Root
            className="bg-white rounded-lg shadow-lg p-4 items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=end]:animate-swipeOut"
            open={open}
            onOpenChange={onOpenChange}
            duration={TOAST_DURATION}
        >
            <RadixToast.Description>{message}</RadixToast.Description>
        </RadixToast.Root>
        <ToastViewport />
    </RadixToast.Provider>
);

export const useToast = () => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');

    const showToast = useCallback((msg: string) => {
        setMessage(msg);
        setOpen(true);
    }, []);

    return {
        Toast: () => <Toast open={open} onOpenChange={setOpen} message={message} />,
        showToast
    };
};