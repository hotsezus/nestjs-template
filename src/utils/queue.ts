import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { Job, Queue } from 'bull';
import { isEmpty, isEqual } from 'lodash';

/**
 * Добавляет задание в очередь, если в очереди отсутствует
 * задание с такими же параметрами
 *
 * @param queue - объект очереди
 * @param name - тип задания (или undefined, если именованные задания не используются)
 * @param data - параметры задания
 */
export async function createSingletonJob<T>(
  queue: Queue<T | undefined>,
  name?: string,
  data?: T | undefined,
): Promise<Job> {
  const existingJobs = await queue.getJobs(['active', 'waiting']);

  const similarJob = existingJobs.find(
    (job: Job) =>
      ((!name && !job.name) || job.name === name) &&
      ((isUndefined(data) && isEmpty(job.data)) || isEqual(job.data, data)),
  );
  if (similarJob) {
    return similarJob;
  }

  if (name) {
    return queue.add(name, data);
  }
  return queue.add(data);
}
