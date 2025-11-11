import { select, isCancel } from '@clack/prompts'
import { storage } from '@/config'
import { AVAILABLE_MODELS } from '@/constants'
import { isValid, ModelSchema } from '@/validation'
import { warning, success, error } from '@/print'
import { displayAppError, createError, ErrorCode } from '@/utils'

export async function selectModel(): Promise<boolean> {
  try {
    const currentModel = await storage.getModel()

    const selectedModel = await select({
      message: 'Select a model:',
      options: AVAILABLE_MODELS.map((model: typeof AVAILABLE_MODELS[number]) => ({
        value: model.value,
        label: model.label,
        hint: model.value === currentModel ? `current` : undefined
      })),
      initialValue: currentModel
    })

    if (isCancel(selectedModel)) {
      warning('Model selection cancelled')
      return false
    }

    if (typeof selectedModel !== 'string') {
      warning('Model selection cancelled')
      return false
    }

    if (!isValid(ModelSchema, selectedModel)) {
      error('Invalid model selected')
      return false
    }

    await storage.setModel(selectedModel)
    success(`✓ Model set to ${selectedModel}`)
    return true
  } catch (err) {
    displayAppError(createError({
      code: ErrorCode.API_ERROR,
      message: 'Failed to set model',
      originalError: err
    }))
    return false
  }
}

