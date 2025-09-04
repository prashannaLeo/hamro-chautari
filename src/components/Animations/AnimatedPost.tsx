import React from 'react';
import { motion, Variants } from 'framer-motion';
import PostCard from '@/components/Feed/PostCard';

interface AnimatedPostProps {
  post: any;
  index?: number;
}

const AnimatedPost: React.FC<AnimatedPostProps> = ({ 
  post, 
  index = 0
}) => {
  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }
    },
    hover: {
      y: -2,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        delay: 0.2 + (index * 0.1)
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      className="relative"
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 opacity-0"
        whileHover={{ 
          opacity: 1,
          transition: { duration: 0.3 }
        }}
      />
      
      {/* Shimmer effect on load */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ 
          duration: 1,
          delay: index * 0.2,
          ease: "easeInOut"
        }}
      />

      <motion.div variants={contentVariants}>
        <PostCard post={post} />
      </motion.div>
    </motion.div>
  );
};

export default AnimatedPost;