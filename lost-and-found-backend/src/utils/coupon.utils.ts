import QRCode from "qrcode";
import Coupon from "../models/coupons.modal";

export const generateCouponCode = async (prefix: string): Promise<string> => {
  let isUnique = false;
  let couponCode = "";

  while (!isUnique) {
    const randomNum = Math.floor(Math.random() * 1000000);
    const timestamp = Date.now().toString().slice(-6);
    couponCode = `${prefix.toUpperCase().slice(0, 3)}-${randomNum}-${timestamp}`;

    const existing = await Coupon.findOne({ couponCode });
    if (!existing) {
      isUnique = true;
    }
  }

  return couponCode;
};

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrCode = await QRCode.toDataURL(data);
    return qrCode;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return "";
  }
};

export const calculateDiscount = (
  totalAmount: number,
  discountType: string,
  discountValue: number,
  maxDiscount?: number,
): number => {
  let discount = 0;

  if (discountType === "percentage") {
    discount = (totalAmount * discountValue) / 100;
    if (maxDiscount) {
      discount = Math.min(discount, maxDiscount);
    }
  } else {
    discount = Math.min(discountValue, totalAmount);
  }

  return discount;
};
