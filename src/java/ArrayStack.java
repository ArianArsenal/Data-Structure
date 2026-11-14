// Array-backed stack (LIFO) with a fixed capacity.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
public class ArrayStack {
    private final int[] data = new int[8];
    private int top = -1;

    public ArrayStack(int... values) {
        for (int v : values) push(v);
    }

    // @op push
    public void push(int value) {
        if (top == data.length - 1) {                       // @step check_full
            throw new IllegalStateException("stack overflow"); // @step overflow
        }
        top++;                          // @step inc_top
        data[top] = value;              // @step place
    }
    // @endop

    // @op pop
    public int pop() {
        if (top == -1) {                                     // @step check_empty
            throw new IllegalStateException("stack underflow"); // @step underflow
        }
        int value = data[top];          // @step grab
        data[top] = 0;                  // @step clear
        top--;                          // @step dec_top
        return value;                   // @step done
    }
    // @endop

    // @op peek
    public int peek() {
        if (top == -1) {                                     // @step check_empty
            throw new IllegalStateException("stack is empty");  // @step empty
        }
        return data[top];               // @step done
    }
    // @endop

    public int size() {
        return top + 1;
    }
}
