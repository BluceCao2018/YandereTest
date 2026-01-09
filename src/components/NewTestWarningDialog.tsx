'use client'
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface NewTestWarningDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isPaidUser: boolean
  currentScore: number
}

export function NewTestWarningDialog({
  isOpen,
  onClose,
  onConfirm,
  isPaidUser,
  currentScore,
}: NewTestWarningDialogProps) {
  const handleSaveImage = () => {
    // Open the native share dialog or save functionality
    // This will trigger the browser's print/save functionality
    window.print()
  }

  if (isPaidUser) {
    // Scenario A: Paid User - Red Warning
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <span className="text-2xl">⚠️</span>
              Warning: You will lose your Paid Report
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="space-y-3 text-sm text-gray-700 pt-4">
            <p>
              Starting a new test will <strong>permanently delete</strong> your current results.
            </p>
            <p>
              Since you <strong>purchased this report</strong>, please ensure you have saved your result image before proceeding.
            </p>
            <p className="text-orange-600 font-medium">
              Note: A new test generates a new result, which requires a new unlock ($2.99).
            </p>
          </DialogDescription>
          <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
            {/* <button
              onClick={handleSaveImage}
              className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              📸 Save Image First
            </button> */}
            <button
              onClick={onConfirm}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              🗑️ I understand, Start New
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Scenario B: Free User - Standard Warning
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">ℹ️</span>
            Start a New Test?
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="space-y-3 text-sm text-gray-700 pt-4">
          <p>
            Your current score (<strong className="text-purple-600">{currentScore}%</strong>) will be cleared.
          </p>
          <p>
            Are you sure you want to retry?
          </p>
          <p className="text-gray-500 text-xs italic">
            (You can also choose 'Test for Partner' to keep your own score saved.)
          </p>
        </DialogDescription>
        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Start New Test
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
