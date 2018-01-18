class Scheduler {
  constructor() {
    this.jobs = {};
  }

  executeJob(name, fn) {
    this.jobs[name] = {};
    const curJob = this.jobs[name];

    curJob.status = true;
    fn();
    curJob.status = false;
  }

  enableJob(name, interval, fn){
    if(this.jobs.hasOwnProperty(name)) {
      return;
    }
    this.jobs[name] = {
      interrupted: false,
    };

    const ctx = this;
    let wrapFn = () => {
      const curJob = ctx.jobs[name];

      curJob.status = true;
      fn();
      curJob.status = false;

      if(!curJob.interrupted) {
        setTimeout(wrapFn, interval);
      }
    };
    wrapFn();
  }

  disableJob(name) {
    this.jobs[name].interrupted = true;
  }

  getJobs() {
    return this.jobs;
  }
}

export {
  Scheduler
}