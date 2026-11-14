// Growable array: doubles when full, halves when a quarter full.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
public class DynamicArray {
    private int[] data = new int[2];
    private int size = 0;
    private int capacity = 2;

    public DynamicArray(int... values) {
        for (int v : values) append(v);
    }

    // @op append
    public void append(int value) {
        if (size == capacity) {         // @step check_full
            resize(2 * capacity);       // @step grow
        }
        data[size] = value;             // @step place
        size++;                         // @step done
    }

    private void resize(int newCapacity) {
        int[] buffer = new int[newCapacity];  // @step alloc
        for (int i = 0; i < size; i++) {      // @step copy_loop
            buffer[i] = data[i];              // @step copy
        }
        data = buffer;                        // @step swap
        capacity = newCapacity;
    }
    // @endop

    // @op pop
    public int pop() {
        if (size == 0) {                                                // @step check_empty
            throw new IndexOutOfBoundsException("pop from empty array"); // @step empty
        }
        size--;                                     // @step shrink
        int value = data[size];                     // @step grab
        data[size] = 0;                             // @step clear
        if (size > 0 && size <= capacity / 4) {     // @step check_quarter
            resize(capacity / 2);                   // @step halve
        }
        return value;                               // @step done
    }
    // @endop

    public int get(int index) {
        if (index < 0 || index >= size) throw new IndexOutOfBoundsException("index out of range");
        return data[index];
    }

    public int size() {
        return size;
    }

    public int capacity() {
        return capacity;
    }
}
