A simple project to simulate random wins in a game over large numbers of iterations.

```45678901234567890123456789012345678901234567890123456789012345678901234567890
Usage: randsim <field_size> <win_count> <iterations> <chunk_size>

  field_size    The total number of unique results possible in each simulation.
                [Default: 1024]
  
  win_count     The number of winning results in each simulation. Must be less
                than field_size. [Default: 16]
                
  iterations    The total number of simulations that will be run.
                [Default: 102400]
                
  chunk_size    The number of sumilations that will be run concurently before
                writing the result to disk. [Default: 1024]
```

Copyright Jeremy Cliff Armstrong,
All rights reserved except where explicitly stated otherwise.
