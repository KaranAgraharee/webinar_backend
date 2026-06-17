import {
  sendPaymentSuccess,
  sendRegistrationConfirmation,
} from './emailService.js'

const logEmailFailure = (label, error) => {
  console.error(`[email] ${label} failed:`, error?.message || error)
}

export async function sendRegistrationConfirmationSafe(params) {
  try {
    await sendRegistrationConfirmation(params)
  } catch (error) {
    logEmailFailure('registration confirmation', error)
  }
}

export async function sendPaymentSuccessSafe(params) {
  try {
    await sendPaymentSuccess(params)
  } catch (error) {
    logEmailFailure('payment success notification', error)
  }
}
