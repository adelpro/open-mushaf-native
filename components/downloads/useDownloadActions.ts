import { useCallback } from 'react';

import { useAtom } from 'jotai/react';

import { getRiwayaLabel } from '@/constants';
import { getTafseerLabel, TafseerKey } from '@/constants/TafseerCdn';
import { useNotification } from '@/Context/NotificationProvider';
import { useMushafDownload, useTafseerDownload } from '@/hooks';
import { downloadedRiwayat, downloadedTafseers } from '@/jotai/atoms';
import { Riwaya } from '@/types';
import { deleteMushafRiwaya, deleteTafseer } from '@/utils/downloads';

export function useDownloadActions(refreshSizes: () => Promise<void>) {
  const { notify } = useNotification();
  const [, setDownloaded] = useAtom(downloadedRiwayat);
  const [, setDownloadedTafseers] = useAtom(downloadedTafseers);
  const { startRiwaya, cancel: cancelRiwaya } = useMushafDownload();
  const { startTafseer, cancel: cancelTafseer } = useTafseerDownload();
  const handleDownload = useCallback(
    async (riwaya: Riwaya) => {
      try {
        await startRiwaya(riwaya);
        notify(
          `تم تنزيل ${getRiwayaLabel(riwaya)} بنجاح`,
          `dl-riwaya-${riwaya}-done`,
          'success',
        );
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        notify(
          `فشل تنزيل ${getRiwayaLabel(riwaya)} — حاول مرة أخرى`,
          `dl-riwaya-${riwaya}-error`,
          'error',
        );
      } finally {
        void refreshSizes().catch(() => {});
      }
    },
    [startRiwaya, notify, refreshSizes],
  );

  const handleCancel = useCallback(() => {
    cancelRiwaya();
  }, [cancelRiwaya]);

  const handleDelete = useCallback(
    async (riwaya: Riwaya) => {
      try {
        await deleteMushafRiwaya(riwaya);
        setDownloaded((prev) => prev.filter((r) => r !== riwaya));
        notify(
          `تم حذف تنزيل ${getRiwayaLabel(riwaya)}`,
          `dl-riwaya-${riwaya}-del`,
          'neutral',
        );
      } catch {
        notify(`تعذّر الحذف`, `dl-riwaya-${riwaya}-del-error`, 'error');
      } finally {
        void refreshSizes().catch(() => {});
      }
    },
    [setDownloaded, notify, refreshSizes],
  );

  const handleTafseerDownload = useCallback(
    async (key: TafseerKey) => {
      try {
        await startTafseer(key);
        notify(
          `تم تنزيل ${getTafseerLabel(key)} بنجاح`,
          `dl-tafseer-${key}-done`,
          'success',
        );
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        notify(
          `فشل تنزيل ${getTafseerLabel(key)} — حاول مرة أخرى`,
          `dl-tafseer-${key}-error`,
          'error',
        );
      } finally {
        void refreshSizes().catch(() => {});
      }
    },
    [startTafseer, notify, refreshSizes],
  );

  const handleTafseerCancel = useCallback(() => {
    cancelTafseer();
  }, [cancelTafseer]);

  const handleTafseerDelete = useCallback(
    async (key: TafseerKey) => {
      try {
        await deleteTafseer(key);
        setDownloadedTafseers((prev) => prev.filter((k) => k !== key));
        notify(
          `تم حذف تنزيل ${getTafseerLabel(key)}`,
          `dl-tafseer-${key}-del`,
          'neutral',
        );
      } catch {
        notify(`تعذّر الحذف`, `dl-tafseer-${key}-del-error`, 'error');
      } finally {
        void refreshSizes().catch(() => {});
      }
    },
    [setDownloadedTafseers, notify, refreshSizes],
  );

  return {
    handleDownload,
    handleCancel,
    handleDelete,
    handleTafseerDownload,
    handleTafseerCancel,
    handleTafseerDelete,
  };
}
