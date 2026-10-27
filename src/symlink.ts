import fs from 'fs-extra';
import path from 'node:path';

export async function isSymlink(targetPath: string): Promise<boolean> {
  try {
    const stats = await fs.lstat(targetPath);
    return stats.isSymbolicLink();
  } catch {
    return false;
  }
}

export async function getSymlinkTarget(targetPath: string): Promise<string | null> {
  try {
    const isLink = await isSymlink(targetPath);
    if (!isLink) return null;
    return await fs.readlink(targetPath);
  } catch {
    return null;
  }
}

export async function createDirectorySymlink(target: string, destination: string): Promise<void> {
  // Ensure target exists
  if (!(await fs.pathExists(target))) {
    throw new Error(`Target does not exist: ${target}`);
  }

  // Ensure parent directory of destination exists
  await fs.ensureDir(path.dirname(destination));

  // If destination already exists:
  if (await fs.pathExists(destination) || (await isSymlink(destination))) {
    const linkTarget = await getSymlinkTarget(destination);
    if (linkTarget) {
      const resolvedLink = path.resolve(path.dirname(destination), linkTarget);
      const resolvedTarget = path.resolve(target);
      if (resolvedLink === resolvedTarget) {
        return; // Already pointing to the right place
      }
    }
    // Remove existing link or item
    await safeRemove(destination);
  }

  const isWindows = process.platform === 'win32';
  try {
    if (isWindows) {
      // Junction allows non-admin symlinking of directories on Windows
      await fs.symlink(target, destination, 'junction');
    } else {
      await fs.symlink(target, destination, 'dir');
    }
  } catch (err) {
    if (isWindows) {
      // Fallback try standard 'dir' symlink
      await fs.symlink(target, destination, 'dir');
    } else {
      throw err;
    }
  }
}

export async function safeRemove(targetPath: string): Promise<void> {
  try {
    const stats = await fs.lstat(targetPath);
    if (stats.isSymbolicLink()) {
      await fs.unlink(targetPath);
    } else if (stats.isDirectory()) {
      await fs.remove(targetPath);
    } else {
      await fs.unlink(targetPath);
    }
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code !== 'ENOENT') {
      throw err;
    }
  }
}

export async function convertSymlinkToRealDirectory(symlinkPath: string): Promise<void> {
  const isLink = await isSymlink(symlinkPath);
  if (!isLink) return;

  const target = await fs.readlink(symlinkPath);
  const resolvedTarget = path.resolve(path.dirname(symlinkPath), target);

  if (!(await fs.pathExists(resolvedTarget))) {
    await fs.unlink(symlinkPath);
    return;
  }

  // Read into temporary directory or copy
  const tmpPath = `${symlinkPath}.tmp-${Date.now()}`;
  await fs.copy(resolvedTarget, tmpPath, { dereference: true });
  await fs.unlink(symlinkPath);
  await fs.rename(tmpPath, symlinkPath);
}
