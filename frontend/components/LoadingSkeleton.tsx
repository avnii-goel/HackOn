"use client";

interface LoadingSkeletonProps {
  width?: string;
  height?: string;
  rounded?: string;
  className?: string;
}

export default function LoadingSkeleton({
  width = "100%",
  height = "20px",
  rounded = "rounded",
  className = "",
}: LoadingSkeletonProps) {
  return (
    <div
      className={`bg-surface-container animate-pulse ${rounded} ${className}`}
      style={{ width, height }}
    />
  );
}
