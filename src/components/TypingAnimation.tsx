import { useState, useEffect } from 'react';

interface TypingAnimationProps {
  phrases: string[];
  typingSpeed?: number;
  pauseBetween?: number;
  prefix?: string;
  prefixClassName?: string;
  className?: string;
}

const TypingAnimation = ({
  phrases,
  typingSpeed = 60,
  pauseBetween = 700,
  prefix = '',
  prefixClassName = '',
  className = '',
}: TypingAnimationProps) => {
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(blink);
  }, []);

  useEffect(() => {
    if (allDone) return;

    const target = phrases[currentIndex];

    if (currentText === target) {
      if (currentIndex < phrases.length - 1) {
        // Pause, then move to next line
        const t = setTimeout(() => {
          setCompletedLines(prev => [...prev, target]);
          setCurrentText('');
          setCurrentIndex(i => i + 1);
        }, pauseBetween);
        return () => clearTimeout(t);
      } else {
        // Last phrase fully typed — move to completed, stop
        setCompletedLines(prev => [...prev, target]);
        setCurrentText('');
        setAllDone(true);
      }
      return;
    }

    const speed = Math.max(20, typingSpeed + Math.random() * 40 - 20);
    const t = setTimeout(() => {
      setCurrentText(target.slice(0, currentText.length + 1));
    }, speed);
    return () => clearTimeout(t);
  }, [currentText, currentIndex, allDone, phrases, typingSpeed, pauseBetween]);

  const Cursor = () => (
    <span
      className="inline-block w-[2px] h-[1.1em] bg-current align-middle ml-0.5 transition-opacity duration-75"
      style={{ opacity: cursorVisible ? 1 : 0 }}
    />
  );

  return (
    <span className={`flex flex-col ${className}`}>
      {completedLines.map((line, i) => (
        <span key={i}>
          {prefix && <span className={`${prefixClassName} select-none mr-2`}>{prefix}</span>}
          {line}
          {allDone && i === completedLines.length - 1 && <Cursor />}
        </span>
      ))}
      {!allDone && (
        <span>
          {prefix && <span className={`${prefixClassName} select-none mr-2`}>{prefix}</span>}
          {currentText}
          <Cursor />
        </span>
      )}
    </span>
  );
};

export default TypingAnimation;
