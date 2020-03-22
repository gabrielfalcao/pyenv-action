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
