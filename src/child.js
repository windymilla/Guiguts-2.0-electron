process.stderr.write("This was output to stderr\n")

process.on('message', (m) => {
  console.log('Got message:', m);
  process.send('Results of uppercasing message: ' + m.toUpperCase());
});
