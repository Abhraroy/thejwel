import type { AnyCart } from "@/types/CartTypes";
import OptimizedImage from "@/components/OptimizedImage";
import Link from "next/link";

interface CashOnDeliveryConfirmationProps {
  cartItems: AnyCart;
  selectedAddressDetails: any | null;
  orderTotal: string;
  couponDiscount?: number;
  onBack: () => void;
  onConfirm: () => Promise<void> | void;
  isLoadingConfirm?: boolean;
  errorMessage?: string | null;
}

export default function CashOnDeliveryConfirmation({
  cartItems,
  selectedAddressDetails,
  orderTotal,
  couponDiscount = 0,
  onBack,
  onConfirm,
  isLoadingConfirm = false,
  errorMessage = null,
}: CashOnDeliveryConfirmationProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="w-full space-y-3">
          <div className="rounded-lg border border-[#360000]/20 bg-white p-3 sm:p-4 space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-[#360000]">
              Confirm Cash on Delivery
            </h3>

            <div className="rounded-md border border-amber-200 bg-amber-50 p-2.5">
              <p className="text-xs font-semibold text-[#360000] mb-1">Products</p>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cartItems.map((item: any, index: number) => {
                  const product = item?.products ?? item?.product ?? item;
                  const productName = product?.product_name ?? product?.name ?? "Product";
                  const qty = Number(item?.quantity ?? 1) || 0;
                  const productPrice = Number(product?.final_price ?? product?.price ?? 0);
                  const productImage =
                    product?.thumbnail_image ?? product?.image_url ?? null;
                  const productId = product?.product_id ?? product?.id ?? null;
                  const productLink = productId ? `/product/${productId}` : null;

                  return (
                    <div
                      key={`${product?.product_id ?? productName}-${index}`}
                      className="flex items-center gap-3 rounded-md border border-[#360000]/15 bg-white p-2.5"
                    >
                      {productLink ? (
                        <Link
                          href={productLink}
                          className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-md border border-[#7A1C1C]/20 bg-white"
                        >
                          {productImage ? (
                            <OptimizedImage
                              src={productImage}
                              alt={productName}
                              preset="thumbnail"
                              fill
                              objectFit="cover"
                              sizes="(max-width: 640px) 80px, 96px"
                            />
                          ) : (
                            <div className="h-full w-full bg-[#CAF2FF]" />
                          )}
                        </Link>
                      ) : (
                        <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-md border border-[#7A1C1C]/20 bg-white">
                          {productImage ? (
                            <OptimizedImage
                              src={productImage}
                              alt={productName}
                              preset="thumbnail"
                              fill
                              objectFit="cover"
                              sizes="(max-width: 640px) 80px, 96px"
                            />
                          ) : (
                            <div className="h-full w-full bg-[#CAF2FF]" />
                          )}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        {productLink ? (
                          <Link
                            href={productLink}
                            className="block text-sm sm:text-base font-semibold text-[#360000] hover:underline wrap-break-word leading-snug"
                          >
                            {productName}
                          </Link>
                        ) : (
                          <p className="text-sm sm:text-base font-semibold text-[#360000] wrap-break-word leading-snug">
                            {productName}
                          </p>
                        )}
                        <p className="mt-1 text-xs sm:text-sm text-gray-700">
                          Qty: {qty}
                        </p>
                        <p className="text-sm font-bold text-[#360000]">
                          ₹{(productPrice * qty).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-gray-50 p-2.5">
              <p className="text-xs font-semibold text-[#360000] mb-1">Delivery Address</p>
              {selectedAddressDetails ? (
                <>
                  <p className="text-xs text-gray-700">{selectedAddressDetails.street_address}</p>
                  <p className="text-xs text-gray-700">
                    {selectedAddressDetails.city}, {selectedAddressDetails.state} -{" "}
                    {selectedAddressDetails.postal_code}
                  </p>
                  <p className="text-xs text-gray-700">{selectedAddressDetails.country}</p>
                </>
              ) : (
                <p className="text-xs text-gray-600">Please select an address to continue.</p>
              )}
            </div>

            {couponDiscount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Coupon discount</span>
                <span className="text-green-600 font-semibold">-₹{couponDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-900">Total Amount</span>
              <span className="text-base font-bold text-amber-600">₹{orderTotal}</span>
            </div>
            {errorMessage ? (
              <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <button
            onClick={onConfirm}
            disabled={!selectedAddressDetails || isLoadingConfirm}
            className="flex-1 px-3 py-2.5 bg-[#DECAF2] text-[#360000] text-sm font-semibold rounded-md hover:bg-[#d3b9ec] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoadingConfirm ? "Placing COD Order..." : "Confirm Order"}
          </button>
          <button
            onClick={onBack}
            disabled={isLoadingConfirm}
            className="flex-1 px-3 py-2.5 border border-[#360000]/20 text-[#360000] text-sm font-semibold rounded-md hover:bg-gray-100 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
