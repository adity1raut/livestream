
import React from 'react';
import { Check, X } from 'lucide-react';

const SuccessErrorToast = ({ success, error }) => (
  (success || error) && (
    <div className="fixed top-4 right-4 z-50">
      <div className={`p-4 rounded-lg shadow-lg ${success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
        <div className="flex items-center gap-2">
          {success ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          {success || error}
        </div>
      </div>
    </div>
  )
);

export default SuccessErrorToast;