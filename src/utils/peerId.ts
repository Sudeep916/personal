export function derivePeerId(name: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized ? `chat-${normalized}` : `peer-${crypto.randomUUID().slice(0, 8)}`;
}
