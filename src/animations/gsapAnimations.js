import { gsap } from 'gsap';

// Fade in animation
export const fadeIn = (element, duration = 0.5, delay = 0) => {
  gsap.from(element, {
    opacity: 0,
    y: 20,
    duration,
    delay,
    ease: 'power2.out'
  });
};

// Slide in from left
export const slideInLeft = (element, duration = 0.5, delay = 0) => {
  gsap.from(element, {
    opacity: 0,
    x: -50,
    duration,
    delay,
    ease: 'power2.out'
  });
};

// Slide in from right
export const slideInRight = (element, duration = 0.5, delay = 0) => {
  gsap.from(element, {
    opacity: 0,
    x: 50,
    duration,
    delay,
    ease: 'power2.out'
  });
};

// Scale up animation
export const scaleUp = (element, duration = 0.3) => {
  gsap.from(element, {
    scale: 0.9,
    opacity: 0,
    duration,
    ease: 'back.out(1.7)'
  });
};

// Stagger animation for lists
export const staggerFadeIn = (elements, duration = 0.3, stagger = 0.1) => {
  gsap.from(elements, {
    opacity: 0,
    y: 20,
    duration,
    stagger,
    ease: 'power2.out'
  });
};

// Counter animation
export const animateCounter = (element, end, duration = 1) => {
  const obj = { value: 0 };
  gsap.to(obj, {
    value: end,
    duration,
    ease: 'power1.out',
    onUpdate: () => {
      if (element) {
        element.textContent = Math.round(obj.value);
      }
    }
  });
};

// Pulse animation for notifications
export const pulse = (element) => {
  gsap.to(element, {
    scale: 1.1,
    duration: 0.3,
    yoyo: true,
    repeat: 1,
    ease: 'power1.inOut'
  });
};

// Page transition
export const pageTransition = (element) => {
  gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
  );
};

export default {
  fadeIn,
  slideInLeft,
  slideInRight,
  scaleUp,
  staggerFadeIn,
  animateCounter,
  pulse,
  pageTransition
};