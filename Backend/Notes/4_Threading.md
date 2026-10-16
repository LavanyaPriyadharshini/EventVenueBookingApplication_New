what is a thread ?
A thread is an execution path through which a program executes the instructions

what is a single thread ?
it is Asynchronous - single worker, many tasks

what is multi threading?
(multiple workers , many tasks)

Process -> the entire restaurant - the running application
Thread -> A chef working on a task.
CPU Core- the physical computing resource that can execute instructions
Task -> the work that needs to be completed, such as generating a report.

A program can have one thread or multiple threads.

Single-threaded execution
------------------------------
Task A — 3 seconds
Task A — 3 seconds
Task B — 2 seconds

Total: 3 + 2 + 4 = 9 seconds

Assuming each task takes the stated time and nothing overlaps, the thread completes them one after another.

What happens with multiple threads?

Different threads can make progress on different tasks. Depending on the CPU and what the tasks are doing, execution may overlap or occur simultaneously.

Multiple threads
----------------------
Illustrative timeline — two threads

Thread 1 -Task A
Thread 2 -Task B

Both threads can run at the same time on separate CPU cores, or take turns on a core.

Example of creating Muliple thread?

using System;
using System.Threading;

class Program
{
    static void Main()
    {
        Thread thread1 = new Thread(() =>
        {
            Console.WriteLine("Task A is running");
        });

        Thread thread2 = new Thread(() =>
        {
            Console.WriteLine("Task B is running");
        });

        thread1.Start();
        thread2.Start();

        Console.WriteLine("Main method is running");
    }
}


Let's understand the important parts:
---------------------------------------
new Thread(...) creates a thread object.

Start() asks the runtime to start executing the thread.

The lambda () => { ... } contains the code that the thread executes.

The main thread can continue executing while the other threads are running.

4. What is the main thread?

The main thread is the initial thread that starts executing a console application's entry point, usually Main().

Thread vs Task vs async/await
------------------------------
Thread
A mechanism for executing code. A thread is an execution resource.
Task

A representation of an operation that may complete in the future. A Task does not necessarily own a dedicated thread.

async/await
C# language features that make asynchronous control flow easier to write and understand. They do not automatically create new threads.


9. What happens when multiple threads access the same data?

This is where threading becomes difficult.

Imagine two threads are updating the same employee's leave balance.

Initial balance = 10 days.

Thread A reads 10 and subtracts 2.

Thread B reads 10 and subtracts 3.

Thread A writes 8.

Thread B writes 7.

The expected final balance is 5, but the actual balance may become 7 or 8 because both threads used the original value.

This is called a race condition.

What is a race condition?
---------------------------
A race condition occurs when the outcome depends on the timing or interleaving of concurrent operations.

What is a critical section?

A critical section is a portion of code that accesses shared state and needs protection against conflicting access.


14. Is the main thread the same as the UI thread?

No, although they may be the same thread in some applications.

Main thread: The initial application entry-point thread in a typical console application.

UI thread: The thread responsible for processing UI events and updating UI elements in many desktop frameworks.

Worker thread: A thread performing work away from the main/UI thread.

ThreadPool thread: A reusable worker thread managed by .NET.

Background thread: A .NET thread marked as not keeping the process alive on its own.
