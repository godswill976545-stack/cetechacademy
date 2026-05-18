import React from 'react';
import { motion } from 'motion/react';

const InteractiveButton = ({ children, className = '', onClick, type = 'button', ...props }) => {
  return (
    <motion.button
      type={type}
      className={className}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default InteractiveButton;
