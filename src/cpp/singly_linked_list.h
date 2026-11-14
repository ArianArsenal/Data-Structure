// Singly linked list of integers.
//
// Lines tagged `// @step <id>` and the `// @op` / `// @endop` markers drive the
// visualizer (tools/build_code.js strips them); the code itself is plain C++17.
#pragma once
#include <stdexcept>
#include <vector>

class SinglyLinkedList {
public:
    struct Node {
        int value;
        Node* next;
        explicit Node(int v) : value(v), next(nullptr) {}
    };

    SinglyLinkedList() = default;
    explicit SinglyLinkedList(const std::vector<int>& values) {
        for (int v : values) insertTail(v);
    }
    ~SinglyLinkedList() {
        while (head) {
            Node* next = head->next;
            delete head;
            head = next;
        }
    }
    SinglyLinkedList(const SinglyLinkedList&) = delete;
    SinglyLinkedList& operator=(const SinglyLinkedList&) = delete;

    // @op insert_head
    void insertHead(int value) {
        Node* node = new Node(value);  // @step create
        node->next = head;             // @step link
        head = node;                   // @step set_head
        length++;                      // @step done
    }
    // @endop

    // @op insert_tail
    void insertTail(int value) {
        Node* node = new Node(value);  // @step create
        if (head == nullptr) {         // @step check_empty
            head = node;               // @step set_head
        } else {
            Node* curr = head;              // @step start
            while (curr->next != nullptr) { // @step loop
                curr = curr->next;          // @step advance
            }
            curr->next = node;              // @step link
        }
        length++;                      // @step done
    }
    // @endop

    // @op insert_at
    void insertAt(int index, int value) {
        if (index < 0 || index > length) {              // @step check_bounds
            throw std::out_of_range("index out of range"); // @step out_of_range
        }
        if (index == 0) {           // @step check_front
            insertHead(value);      // @step call_head
            return;
        }
        Node* node = new Node(value);        // @step create
        Node* prev = head;                   // @step start
        for (int i = 0; i < index - 1; i++) { // @step loop
            prev = prev->next;               // @step advance
        }
        node->next = prev->next;             // @step link_next
        prev->next = node;                   // @step link_prev
        length++;                            // @step done
    }
    // @endop

    // @op delete_value
    bool deleteValue(int value) {
        if (head == nullptr) {          // @step check_empty
            return false;               // @step empty
        }
        if (head->value == value) {     // @step check_head
            Node* target = head;        // @step grab_head
            head = target->next;        // @step unlink_head
            delete target;              // @step release_head
            length--;
            return true;                // @step done_head
        }
        Node* prev = head;                    // @step start
        while (prev->next != nullptr) {       // @step loop
            if (prev->next->value == value) { // @step compare
                Node* target = prev->next;    // @step grab
                prev->next = target->next;    // @step unlink
                delete target;                // @step release
                length--;
                return true;                  // @step done
            }
            prev = prev->next;                // @step advance
        }
        return false;                         // @step not_found
    }
    // @endop

    // @op search
    int search(int value) const {
        Node* curr = head;              // @step start
        int index = 0;
        while (curr != nullptr) {       // @step loop
            if (curr->value == value) { // @step compare
                return index;           // @step found
            }
            curr = curr->next;          // @step advance
            index++;
        }
        return -1;                      // @step not_found
    }
    // @endop

    // @op reverse
    void reverse() {
        Node* prev = nullptr;        // @step init
        Node* curr = head;
        while (curr != nullptr) {    // @step loop
            Node* nxt = curr->next;  // @step save_next
            curr->next = prev;       // @step flip
            prev = curr;             // @step move_prev
            curr = nxt;              // @step move_curr
        }
        head = prev;                 // @step set_head
    }
    // @endop

    std::vector<int> toVector() const {
        std::vector<int> out;
        for (Node* n = head; n != nullptr; n = n->next) out.push_back(n->value);
        return out;
    }

    int size() const { return length; }

private:
    Node* head = nullptr;
    int length = 0;
};
