import dotenv from 'dotenv'
import Razorpay from 'razorpay'

dotenv.config({ path: new URL('../.env', import.meta.url) })

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

async function run() {
  try {
    const order = await razorpay.orders.create({
      amount: 100, // INR 1.00
      currency: 'INR',
      receipt: 'test_rcpt_001',
    })

    console.log('ORDER CREATED:', order)
  } catch (err) {
    console.error('Razorpay create order error:')
    try {
      console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2))
    } catch (e) {
      console.error(err)
    }
    process.exit(1)
  }
}

run()
