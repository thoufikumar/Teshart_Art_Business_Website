import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { type ArtworkId } from "../domain/artworkRegistry"

import {
  type FinishOptionId,
  type PortraitSizeId,
  type PortraitTypeId,
  isSupportedConfiguration,
} from "../domain/catalogue"

import {
  INITIAL_ORDER_DRAFT,
  normalizeOrderConfiguration,
  type DeliveryDetails,
  type OrderDraft,
  type PaymentMethodId,
} from "../domain/order"

import {
  calculateOrderPricing,
  DEFAULT_PRICING_POLICY,
  type PriceBreakdown,
  type PricingPolicy,
} from "../domain/pricing"

import { type CheckoutStepIndex } from "../config/routes"

export interface ConfirmedOrderState {
  orderNumber: string
  trackingToken: string
  pricing: {
    totalAmountInr: number
    advancePayableInr: number
    remainingOnDeliveryInr: number
    currency: string
  }
}

export interface OrderContextValue {
  draft: OrderDraft

  step: CheckoutStepIndex

  pricing: PriceBreakdown

  pricingPolicy: PricingPolicy

  confirmedOrder: ConfirmedOrderState | null

  uploadedFile: File | null

  setStep: (step: CheckoutStepIndex) => void

  selectPortraitType: (portraitType: PortraitTypeId) => void

  selectSize: (size: PortraitSizeId) => void

  selectFinish: (finish: FinishOptionId) => void

  setUploadedPhotoUrl: (
    url: string | null,
    meta?: { fileName?: string; fileSizeBytes?: number; mimeType?: string },
  ) => void

  setUploadedFile: (file: File | null) => void

  selectSamplePhoto: (sampleArtworkId: ArtworkId) => void

  updateDelivery: (patch: Partial<DeliveryDetails>) => void

  selectPaymentMethod: (method: PaymentMethodId) => void

  setConfirmedOrder: (order: ConfirmedOrderState | null) => void

  resetDraft: () => void
}

const OrderContext = createContext<OrderContextValue | null>(null)

export function OrderProvider({
  children,

  pricingPolicy = DEFAULT_PRICING_POLICY,
}: {
  children: ReactNode

  pricingPolicy?: PricingPolicy
}) {
  const [draft, setDraft] = useState<OrderDraft>(INITIAL_ORDER_DRAFT)

  const [step, setStep] = useState<CheckoutStepIndex>(0)

  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrderState | null>(null)

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const selectPortraitType = (portraitType: PortraitTypeId) => {
    setDraft((prev) => ({
      ...prev,

      configuration: normalizeOrderConfiguration(
        portraitType,

        prev.configuration.size,

        prev.configuration.finish,
      ),
    }))
  }

  const selectSize = (size: PortraitSizeId) => {
    setDraft((prev) => {
      if (
        !isSupportedConfiguration(
          prev.configuration.portraitType,
          size,
          prev.configuration.finish,
        )
      ) {
        return prev
      }

      return {
        ...prev,

        configuration: {
          ...prev.configuration,

          size,
        },
      }
    })
  }

  const selectFinish = (finish: FinishOptionId) => {
    setDraft((prev) => {
      if (
        !isSupportedConfiguration(
          prev.configuration.portraitType,
          prev.configuration.size,
          finish,
        )
      ) {
        return prev
      }

      return {
        ...prev,

        configuration: {
          ...prev.configuration,

          finish,
        },
      }
    })
  }

  const setUploadedPhotoUrl = (
    url: string | null,

    meta?: { fileName?: string; fileSizeBytes?: number; mimeType?: string },
  ) => {
    setDraft((prev) => ({
      ...prev,

      photo: url
        ? {
            sourceType: "upload",

            previewUrl: url,

            fileName: meta?.fileName,

            fileSizeBytes: meta?.fileSizeBytes,

            mimeType: meta?.mimeType,
          }
        : {
            sourceType: "none",

            previewUrl: null,
          },
    }))
  }

  const selectSamplePhoto = (sampleArtworkId: ArtworkId) => {
    setDraft((prev) => ({
      ...prev,

      photo: {
        sourceType: "sample",

        previewUrl: null,

        sampleArtworkId,
      },
    }))
  }

  const updateDelivery = (patch: Partial<DeliveryDetails>) => {
    setDraft((prev) => ({
      ...prev,

      delivery: {
        ...prev.delivery,

        ...patch,
      },
    }))
  }

  const selectPaymentMethod = (paymentMethod: PaymentMethodId) => {
    setDraft((prev) => ({
      ...prev,

      paymentMethod,
    }))
  }

  const resetDraft = () => {
    setDraft(INITIAL_ORDER_DRAFT)

    setStep(0)

    setConfirmedOrder(null)

    setUploadedFile(null)
  }

  const pricing = useMemo(
    () =>
      calculateOrderPricing(
        draft.configuration.portraitType,

        draft.configuration.size,

        draft.configuration.finish,

        pricingPolicy,
      ),

    [
      draft.configuration.portraitType,

      draft.configuration.size,

      draft.configuration.finish,

      pricingPolicy,
    ],
  )

  const value: OrderContextValue = {
    draft,

    step,

    pricing,

    pricingPolicy,

    confirmedOrder,

    uploadedFile,

    setStep,

    selectPortraitType,

    selectSize,

    selectFinish,

    setUploadedPhotoUrl,

    setUploadedFile,

    selectSamplePhoto,

    updateDelivery,

    selectPaymentMethod,

    setConfirmedOrder,

    resetDraft,
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrder(): OrderContextValue {
  const ctx = useContext(OrderContext)

  if (!ctx) {
    throw new Error("useOrder must be used within an OrderProvider")
  }

  return ctx
}
