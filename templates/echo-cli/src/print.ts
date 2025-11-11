import chalk from 'chalk'

export function info(message: string): void {
  console.log(chalk.cyan(message))
}

export function success(message: string): void {
  console.log(chalk.green(message))
}

export function warning(message: string): void {
  console.log(chalk.yellow(message))
}

export function error(label: string, message?: string): void {
  if (message) {
    console.log(chalk.red(label), message)
  } else {
    console.log(chalk.red(label))
  }
}

export function header(message: string): void {
  console.log(chalk.bold(message))
}

export function label(label: string, value: string): void {
  console.log(chalk.gray(label), value)
}

export function hint(message: string): void {
  console.log(chalk.dim(message))
}

export function aiResponse(agentName: string, message: string): void {
  process.stdout.write(chalk.blue(`${agentName}: `) + message)
}

export function write(text: string): void {
  process.stdout.write(text)
}

export function newLine(): void {
  process.stdout.write('\n')
}

export function blankLine(): void {
  console.log()
}

