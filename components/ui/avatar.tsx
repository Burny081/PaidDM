/* eslint-disable @next/next/no-img-element -- this primitive deliberately exposes native image props and refs. */
import { forwardRef, type ImgHTMLAttributes } from "react";

export const Avatar = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(
  function Avatar({ className = "", alt = "", ...props }, ref) {
    return <img ref={ref} alt={alt} className={`avatar ${className}`.trim()} {...props} />;
  },
);

Avatar.displayName = "Avatar";
