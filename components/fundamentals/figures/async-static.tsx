/* Static illustrations for Module 3. */

export function ThreadPool() {
  const threads: [string, string, string][] = [
    ["Thread 1", "dns.lookup(\"api.slow.example\")", "2.1 s and counting"],
    ["Thread 2", "dns.lookup(\"cdn.slow.example\")", "1.8 s and counting"],
    ["Thread 3", "dns.lookup(\"auth.slow.example\")", "1.6 s and counting"],
    ["Thread 4", "zlib.gzip(8 MB)", "40 ms"],
  ];
  return <div className="fx-pool">
    <div className="fx-pool-main"><span className="fx-actor-role">Main thread · event loop</span><strong>Runs JavaScript, waits in epoll for sockets</strong><span className="fx-actor-meta">HTTP sockets bypass the pool entirely</span></div>
    <div className="fx-pool-arrow" aria-hidden="true">submits blocking work ↓</div>
    <div className="fx-pool-body">
      <div className="fx-pool-queue"><span className="fx-actor-role">Pool queue</span><ol><li className="is-waiting">fs.readFile(&quot;config.json&quot;)<span>waiting 1.6 s</span></li><li className="is-waiting">crypto.pbkdf2(…)<span>waiting</span></li></ol></div>
      <div className="fx-pool-threads"><span className="fx-actor-role">libuv thread pool · 4 threads</span><ul>{threads.map(([name, job, time]) => <li key={name} className={job.startsWith("dns") ? "is-slow" : ""}><strong>{name}</strong><code>{job}</code><span>{time}</span></li>)}</ul></div>
    </div>
  </div>;
}

export function IoModels() {
  return <div className="fx-io">
    <div className="fx-io-col">
      <h4>Thread per connection</h4>
      <ul className="fx-io-threads">{[7, 8, 9, 12, 15].map((fd) => <li key={fd}><span>T{fd - 6}</span><code>read(fd {fd})</code><em>asleep</em></li>)}<li className="is-more">… 10,000 threads, 10,000 stacks</li></ul>
      <p>Simple code. Memory and scheduling cost grow with every idle connection.</p>
    </div>
    <div className="fx-io-col">
      <h4>Readiness · epoll, kqueue</h4>
      <ol className="fx-io-flow">
        <li><code>epoll_wait()</code><span>one thread sleeps on all sockets</span></li>
        <li className="is-gold"><code>→ fd 7, fd 12 ready</code><span>kernel reports what can be read now</span></li>
        <li><code>read(7) · read(12)</code><span>your code does the reads</span></li>
        <li><code>↻ back to epoll_wait</code><span>loop</span></li>
      </ol>
      <p>One thread holds thousands of idle connections for a few KB each.</p>
    </div>
    <div className="fx-io-col">
      <h4>Completion · io_uring</h4>
      <div className="fx-ring"><span className="fx-actor-role">Submission queue</span><code>read fd 7 → buf A</code><code>read fd 12 → buf B</code><code>write fd 3 ← buf C</code></div>
      <div className="fx-ring-kernel" aria-hidden="true">kernel performs the I/O ↓</div>
      <div className="fx-ring is-done"><span className="fx-actor-role">Completion queue</span><code>fd 7: 512 bytes in buf A</code><code>fd 3: 4096 bytes written</code></div>
      <p>Batches many operations per system call, and handles files too.</p>
    </div>
  </div>;
}
