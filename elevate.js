const { execFile } = require('child_process');
const path = require('path');

// Функция для выполнения команды с повышенными привилегиями
function runElevated(command, args, callback) {
  // Указываем путь к elevate.exe
  const elevatePath = path.join(__dirname, 'elevate.exe');

  console.log(`Running command with elevated privileges: ${command} ${args.join(' ')}`);
  execFile(elevatePath, [command, ...args], { windowsHide: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing elevated command: ${error.message}`);
    }
    if (callback) {
      callback(error, stdout, stderr);
    }
  });
}

// Экспортируем функцию
module.exports = runElevated;