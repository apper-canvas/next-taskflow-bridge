import { forwardRef } from 'react';

const Textarea = forwardRef(({ 
  label,
  error,
  rows = 3,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        className={`
          block w-full rounded-lg border-2 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-500 transition-all duration-200 resize-vertical
          ${error 
            ? 'border-error focus:border-error focus:ring-error/20' 
            : 'border-gray-300 focus:border-primary focus:ring-primary/20'
          }
          focus:ring-4 focus:outline-none
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-error font-medium">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;