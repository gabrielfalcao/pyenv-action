import * as fs from 'fs';

export function file_exists(file_path: string): boolean {
  if (!fs.existsSync(file_path)) {
    return false;
  }
  const st = fs.statSync(file_path);
  return st.isFile();
}
export function folder_exists(folder_path: string): boolean {
  if (!fs.existsSync(folder_path)) {
    return false;
  }
  const st = fs.statSync(folder_path);
  return st.isDirectory();
}
export function splitcommas(name: string): Array<string> {
  return name
    .split(',')
    .map(function(path) {
      return path.trim();
    })
    .filter(name => name.length > 0);
}

function __only_unique__(value: string, index: number, self: Array<string>) {
  return self.indexOf(value) === index;
}

export function unique(values: Array<string>): Array<string> {
  return values.filter(__only_unique__);
}
