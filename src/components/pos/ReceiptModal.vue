<!-- src/components/ReceiptModal.vue -->
<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white p-6 rounded-lg md:w-1/3 w-full max-w-md" id="receiptContainer">
      <h2 class="text-xl font-bold mb-4">Transaction Receipt</h2>
      <p><strong>Transaction ID:</strong> {{ transactionId }}</p>
      <div class="my-4 text-center">
        <svg id="barcodeElement"></svg>
      </div>
      <div class="text-sm mb-4">
        <p><strong>Customer:</strong> {{ receiptData.customerName || 'N/A' }}</p>
        <p><strong>Payment Type:</strong> {{ receiptData.paymentType }}</p>
        <p><strong>Amount Due:</strong> ₱{{ receiptData.total }}</p>
        <p><strong>Status:</strong> {{ receiptData.status }}</p>
      </div>
      <div v-if="receiptData.items && receiptData.items.length" class="font-mono text-xs mb-4">
        <div class="flex border-b pb-1">
          <div class="w-40">Item</div>
          <div class="w-16 text-right">Qty</div>
          <div class="w-24 text-right">Price</div>
          <div class="w-24 text-right">Disc</div>
          <div class="w-24 text-right">Total</div>
        </div>
        <div v-for="item in receiptData.items" :key="item.id" class="flex">
          <div class="w-40 truncate">{{ item.item?.name ?? item.name }}</div>
          <div class="w-16 text-right">{{ item.quantity }}</div>
          <div class="w-24 text-right">₱{{ item.price }}</div>
          <div class="w-24 text-right">₱{{ item.discount }}</div>
          <div class="w-24 text-right">₱{{ (item.price - item.discount) * item.quantity }}</div>
        </div>
      </div>
      <p class="text-lg font-bold mb-4">Grand Total: ₱{{ receiptData.total }}</p>
      <div class="flex justify-end gap-2 no-print">
        <button
          type="button"
          v-print="printOptions"
          class="p-2 bg-[#b51919] text-white rounded hover:bg-[#a31818]"
        >
          Print
        </button>
        <button
          type="button"
          @click="$emit('close')"
          class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
const props = defineProps({
  transactionId: String,
  receiptData: Object,
  printOptions: Object
})
</script>
