import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


/*Функция activate инициализирует плагина Visual Studio Code.
Она регистрирует команду создания структуры проекта и определяет поведение, когда команда запускается.*/
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.createProjectStructure', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('Откройте рабочую папку для создания структуры проекта');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        
        // Запрашиваем название проекта
        const projectName = await vscode.window.showInputBox({
            prompt: "Введите название проекта",
            value: "myProject"
        });

        if (!projectName) {
            vscode.window.showErrorMessage('Название проекта не указано');
            return;
        }
        
        const structure = {
            "bin": {
                "main.cpp": await getContent('main.template'),
                
                
                "CMakeLists.txt": await getContent('BinCMake.template')
            },
            "lib": {
                "CMakeLists.txt": await getContent('LibCMake.template')
            },
            "README.md": await getContent('README.template'),
            ".gitignore": await getContent('.gitignore.template'),
            "CMakeLists.txt": await getContent('ProjectCMake.template')
            
        };

        createStructure(rootPath, structure, projectName);
        vscode.window.showInformationMessage('Структура проекта успешно создана!');
    });

    context.subscriptions.push(disposable);
}


/* Функция getContent читает содержимое файла по указанному пути и возвращает его как строку. */
async function getContent(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const templatePath = path.join(__dirname, '../templates', filePath);
        fs.readFile(templatePath, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// Рекурсивная функция для создания структуры файлов и папок
function createStructure(Path: string, structure: any, projectName: string) {
    for (const name in structure) {
        const itemPath = path.join(Path, name);
        if (typeof structure[name] === 'string') {
            const content = structure[name].replace(/\${projectName}/g, projectName);
            fs.writeFileSync(itemPath, content);
        } else {
            if (!fs.existsSync(itemPath)) {
                fs.mkdirSync(itemPath);
            }
            createStructure(itemPath, structure[name], projectName);
        }
    }
}


