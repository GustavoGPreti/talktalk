'use client';

import { FC, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';

interface TimelineItemProps {
  title: string;
  date: string;
  description: string;
  isLeft?: boolean;
  icon?: React.ReactNode;
  color?: string;
  isLast?: boolean;
  image?: string;
  imageAlt?: string;
}

const TimelineItem: FC<TimelineItemProps> = ({
  title,
  date,
  description,
  isLeft = false,
  icon,
  image,
  imageAlt,
  color = '#3B82F6',
  isLast = false,
}) => {  const itemRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(itemRef, { 
    once: true, 
    amount: 0.1,
    margin: "0px 0px -100px 0px"
  });return (
    <div ref={itemRef} className={`timeline-item relative py-6 sm:py-8 md:py-12 ${isLast ? 'pb-0' : ''}`}>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 z-30 flex justify-center">
        <motion.div
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white shadow-lg border-2 sm:border-4 border-white dark:border-gray-800"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 20px ${color}70`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {icon || (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-7 sm:w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </motion.div>
      </div>
      <motion.div
        className={`absolute ${
          isLeft 
            ? 'right-2 sm:right-4 md:right-[55%] lg:right-[55%]' 
            : 'left-2 sm:left-4 md:left-[55%] lg:left-[55%]'
        } top-14 sm:top-16 md:top-2 z-50 bg-white dark:bg-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg border-2`}
        style={{ borderColor: color }}
        initial={{ opacity: 0, x: isLeft ? 20 : -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? 20 : -20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <span className="text-xs sm:text-sm md:text-base font-bold" style={{ color }}>
          {date}
        </span>
      </motion.div>
      <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 relative pt-20 sm:pt-24 md:pt-0">
        <motion.div
          className={`w-full order-1 ${isLeft ? 'md:order-1 md:col-start-1' : 'md:order-2 md:col-start-2'} md:col-span-1`}
          initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -30 : 30 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        ><div
            className={`relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-t-4 border-l-4 ${isLeft ? 'md:text-right' : 'md:text-left'} hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:scale-[1.02]`}
            style={{ borderColor: color, boxShadow: `0 4px 20px ${color}30` }}
          >
            <div className="p-4 sm:p-5 lg:p-6 xl:p-8"><motion.h3 
                className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-3 lg:mb-4 text-gray-800 dark:text-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {title}
              </motion.h3>
              
              <motion.p 
                className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {description}
              </motion.p>
              
              <motion.div
                className="mt-6 h-1 rounded-full opacity-20"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={isInView ? { width: '100%' } : { width: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              />
            </div>
          </div>
        </motion.div>
        {image && (
          <motion.div
            className={`order-2 ${isLeft ? 'md:order-2 md:col-start-2' : 'md:order-1 md:col-start-1'} col-span-1 mt-4 md:mt-0`}
            initial={{ opacity: 0, x: isLeft ? 30 : -30, scale: 0.9 }}
            animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: isLeft ? 30 : -30, scale: 0.9 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="relative z-10 group">
              <div 
                className="absolute inset-0 rounded-2xl opacity-20 blur-xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500"
                style={{ backgroundColor: color }}
              />
              <div className="relative bg-white dark:bg-gray-800 p-2 lg:p-3 rounded-2xl shadow-xl transform group-hover:rotate-2 transition-transform duration-500">
                <div className="relative h-40 sm:h-48 md:h-40 lg:h-56 rounded-xl overflow-hidden"><Image 
                    src={image} 
                    width={600} 
                    height={500} 
                    alt={imageAlt || title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  <div 
                    className="absolute bottom-4 right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: color }}
                  >                    {icon || (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {!image && <div className="hidden md:block"></div>}
      </div>
      {!isLast && (
        <motion.div
          className="absolute left-1/2 top-8 sm:top-12 md:top-12 w-1 h-[calc(100%+12px)] sm:h-[calc(100%+16px)] md:h-[calc(100%+20px)] -translate-x-1/2 -z-10 md:z-5"
          style={{
            background: `linear-gradient(to bottom, ${color} 0%, ${color} 85%, ${color} 100%)`,
            boxShadow: `0 0 8px ${color}40`,
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={isInView ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />
      )}
      
      {isLast && (
        <motion.div
          className="absolute left-1/2 top-8 sm:top-12 md:top-12 w-1 h-[calc(100%-24px)] sm:h-[calc(100%-32px)] md:h-[calc(100%-40px)] -translate-x-1/2 -z-10 md:z-5"
          style={{
            background: `linear-gradient(to bottom, ${color} 0%, ${color} 70%, transparent 100%)`,
            boxShadow: `0 0 8px ${color}40`,
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={isInView ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />
      )}
    </div>
  );
};

export default TimelineItem;
