"use client"

import { useToast } from "@/components/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { ReactElement } from "react"
import { HiThumbUp } from "react-icons/hi"
import { IoWarning } from "react-icons/io5"
import { MdError } from "react-icons/md"



export function Toaster() {
  const { toasts } = useToast()
  const variantIcons: Record<string, ReactElement>= {
    warning : <IoWarning />,
    destructive : <MdError />,
    default : <HiThumbUp />
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex gap-2 items-center">
              {props.variant ? variantIcons[props.variant] : variantIcons['default']}
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            </div>
            
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
