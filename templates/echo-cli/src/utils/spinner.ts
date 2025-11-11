import ora, { Ora } from 'ora'
import chalk, { ChalkInstance } from 'chalk'
import { THINKING_COLORS, THINKING_MESSAGES, THINKING_INTERVAL } from '@/constants'

export function createThinkingSpinner(): Ora {
  const randomMessage = () => THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]
  const randomColor = () => THINKING_COLORS[Math.floor(Math.random() * THINKING_COLORS.length)] as 'blue' | 'cyan' | 'green' | 'yellow' | 'magenta' | 'red'
  
  const getColoredText = (color: string) => {
    const message = randomMessage()
    return (chalk[color as keyof ChalkInstance] as typeof chalk.blue)(message)
  }

  let currentColor = randomColor()
  const spinner = ora({
    text: getColoredText(currentColor),
    color: currentColor,
    spinner: 'dots'
  }).start()

  const interval = setInterval(() => {
    currentColor = randomColor()
    spinner.color = currentColor
    spinner.text = getColoredText(currentColor)
  }, THINKING_INTERVAL)

  const originalStop = spinner.stop.bind(spinner)
  spinner.stop = () => {
    clearInterval(interval)
    return originalStop()
  }

  return spinner
}

