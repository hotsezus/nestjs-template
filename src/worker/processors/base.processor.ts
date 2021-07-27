import { OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

/**
 * Базовый класс процессора очереди.
 * Наследуйте процессоры конкретных очередей от него, чтобы
 * получить стандартное логирование при обработке заданий.
 */
export abstract class BaseProcessor {
  protected constructor(
    protected readonly queueName: string,
    protected readonly logger: Logger,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log({
      msg: 'Job started',
      queue: this.queueName,
      job: job,
    });
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.log({
      msg: 'Job failed',
      queue: this.queueName,
      jobName: job.name,
      jobId: job.id,
      error: err,
      errorStack: err.stack,
    });
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log({
      msg: 'Job completed',
      queueGroup: this.queueName,
      jobName: job.name,
      jobId: job.id,
    });
  }
}
