import { Poppins } from "next/font/google";

// 定义字体
export const FONT = Poppins({
  // 定义字体子集
  subsets: ["latin"],
  // 定义字体权重
  weight: ["400", "500", "600", "700"],
});
