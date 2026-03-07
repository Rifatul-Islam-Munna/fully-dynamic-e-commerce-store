// hooks/use-api-mutation.ts
import { useMutation } from '@tanstack/react-query'
import { sileo } from "sileo";
import { PostRequestAxios, PatchRequestAxios, DeleteRequestAxios } from './api-hooks'

type HttpMethod = 'POST' | 'PATCH' | 'DELETE'

type MutationResult<TData> = {
  data?: TData | null
  error?: {
    message?: string
  } | null
}

function extractMutationId(value: unknown) {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const id = (value as { id?: unknown }).id
  if (typeof id === 'string' || typeof id === 'number') {
    return String(id)
  }

  return undefined
}

interface UseApiMutationConfig<TData = unknown> {
  url: string
  method: HttpMethod
  mutationKey?: string[]
  successMessage?: string
  onSuccess?: (data: TData) => void
  onError?: (error: Error) => void,
}

export function useCommonMutationApi<TData = unknown, TVariables = unknown>(
  config: UseApiMutationConfig<TData>
) {
  const { url, method, mutationKey, successMessage, onSuccess, onError } = config

  // Select the right function based on method
  const getMutationFn = () => {
    switch (method) {
      case 'POST':
        return async (data: TVariables) => {
          const [response, error] = await PostRequestAxios<TData>(url, data)
          return { data: response, error }
        }
      case 'PATCH':
        return async (data: TVariables) => {
          const [response, error] = await PatchRequestAxios<TData>(url, data)
          return { data: response, error }
        }
      case 'DELETE':
        return async (variables: TVariables | string) => {
          const id =
            typeof variables === 'string'
              ? variables
              : extractMutationId(variables)

          const [response, error] = await DeleteRequestAxios<TData>(`${url}?id=${id}`)
          return { data: response, error }
        }
      default:
        throw new Error(`Unsupported method: ${method}`)
    }
  }

  return useMutation({
    mutationKey: mutationKey,
    mutationFn: async (variables: TVariables) => {
      const mutationFn = getMutationFn()
      return mutationFn(variables)
    },
    onSuccess: (data: MutationResult<TData>) => {
      if (data?.data) {
        sileo.success({
          title: "Success",
          description: successMessage || "Success!",
        })
        onSuccess?.(data.data)
        return
      }

      sileo.error({
        title: "Something went wrong",
        description: data?.error?.message || "Unknown error",
      })
      onError?.( {
        message: data?.error?.message || "Unknown error"
      } as Error)
    },
    onError: (error: Error) => {
      sileo.error({
        title: "Something went wrong",
        description: error.message,
      })
      onError?.(error)
    },
  })
}


