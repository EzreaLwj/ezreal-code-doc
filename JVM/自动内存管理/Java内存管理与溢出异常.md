# Java 内存区域与内存溢出异常



## 一、背景

对于 Java 程序员来说，在**虚拟机自动内存管理机制的帮助**下，不再需要为每一个 new 操作去写配对的 delete/free 代码，不容易出现内存泄露和内存溢出的情况。

不过正是因为 Java 程序员把控制内存的权利交给了虚拟机，一但出现内存泄露和内存溢出方面的问题，如果不了解虚拟机是怎样使用内存的，那**排除错误**，**修正问题**将会成为一件**异常困难**的工作。

> 内存泄露与内存溢出的区别
>
> 内存泄露：程序中分配的内存在不再需要的时候没有被正确释放或者回收的情况，这会导致程序持续占用内存，随着时间的推移，可用内存逐渐减少，最终导致性能低下或崩溃；
>
> 内存溢出：程序试图分配超过其可用内存的内存空间的情况；



## 二、运行时数据区域

Java 虚拟机在执行 Java 程序的过程会把它管理的内存划分为若干个不同的数据区域，有的区域随着虚拟机的启动一直存在，有的区域则是依赖用户线程的启动和结束而建立和销毁。

![运行时数据区](https://ezreal-tuchuang-1312880100.cos.ap-guangzhou.myqcloud.com/article/image-20240123223039348.png)

- 黄色：线程共有；
- 绿色：线程私有；



### 2.1 程序计数器

程序计数器（Program Counter Register）是一块较小的空间，它可以看作是**当前线程所执行的字节码的行号指示器**。在 Java 虚拟机的g概念模型里，字节码解释器就是**通过改变计数器的值来选取下一条需要执行的字节码指令**。



由于 Java 虚拟机的多线程是通过线程轮流切换，分配处理器执行时间的方式来实现的，在任何一个确定的时刻，一个处理器都只会执行一个线程中的一个指令。因此，为了线程切换后能恢复到正确的执行位置，每条线程都需要有一个独立的程序计数器，各条线程之间计数器互不影响，独立存储，我们称这类内存区域为 "线程私有" 的内存。



### 2.2 Java 虚拟机栈

与程序计数器一样，Java 虚拟机栈也是线程私有的，生命周期与线程同步。

虚拟机栈描述的是 **Java 方法执行的线程内存模型**：每个方法被执行的时候，Java 虚拟机都会同步创建一个**栈帧**（Stack Frame）用于存储**局部变量表**，**操作数栈**，**动态链接**，**方法出入口**等信息。每一个方法被调用直到执行完毕，就对应着一个栈帧在虚拟机栈中从入栈到出栈的过程。

局部变量表中存放了**编译期**可知的各种 **Java 基本数据类型**（boolean、char、byte、short、int、long、float、double）、**对象引用**和  `returnAddress`类型（指向了一条字节码指令的地址），局部变量表所需的内存空间在编译期间完成分配，当进入一个方法时，这个方法需要在栈帧中分配多大的局部变量空间是完全确定的，在方法运行的期间不会改变局部变量表的大小。



### 2.3 本地方法栈

本地方法栈（Native Method Stack）与虚拟机栈所发挥的作用是非常相似的，其区别只是**虚拟机栈**为虚拟机**执行 Java 方法**（也就是字节码）服务，而**本地方法栈**则是为虚拟机使用到的**本地（Native）方法**服务。



### 2.4 Java 堆

对于 Java 应用来说，Java 堆（Java Heap）是虚拟机所管理的内存中最大的一块。**Java 堆是所有线程共享的一块区域**，在虚拟机启动时创建，**Java 的对象实例以及数组都在这里分配内存**。

Java 堆是垃圾收集器管理的内存区域，因此它也被成为 GC 堆。从回收内存的角度看，由于现代垃圾收集器大部分都是基于分代收集理论设计的，所以 Java 堆中会经常出现 “**新生代**”，“**老年代**”，“**永久代**”，“**Eden空间**”，“**From Survivor 空间**”，“**To Survivor 空间**” 等名词。



### 2.5 方法区

方法区与 Java 堆一样，**是各个线程共享的内存区域**，它用于存储已被虚拟机**加载的类型信息**、**常量**、**静态变量**、**即时编译器编译后的代码缓存**等数据。



### 2.6 运行时常量池

**运行时常量池**（Runtime Constant Pool ）**是方法区的一部分**。**Class 文件**中除了有**类**的**版本**、**字段**、**方法**、**接口**等描述信息，还有一项信息是**常量池表**（Constant Pool Table），用于**存放编译期生成的各种字面量与符号引用**，这部分内容将在**类加载后存放到方法区的运行时常量池中**。

除了保存 Class 文件中描述的**符号引用**外，还会把符号引用翻译出来的**直接引用也存储在运行时常量池**中，也就是将符号地址转化为真实地址。



运行时常量池相对于 Class 文件常量池的另外一个重要特性是具备动态性，Java 语言并不要求常量一定只有编译器才能产生，也就是说，并非预置入 Class 文件中常量池的内容才能进入方法区运行时常量池，运行期间也可以将新的常量放入池中，这种特性被开发人员利用得比较多的便是 String 类的 `intern()` 方法。

> 运行时常量池存储编译期生成的常量池表中的各种字面量和符号引用，也支持在运行期将新的常量放入池中

既然运行时常量区是方法区的一部分，自然收到方法区内存的限制，当常量池无法再申请到内存时会抛出 `OutOfMemoryError` 异常。



#### 2.6.1 常量池

要理解常量池是什么，先看看类的**二进制字节码**包含哪些信息：

- 常量池
- 类的基本信息（类的访问权限，类的名称，实现的接口）
- 类的方法定义（虚拟机指令，我们的代码会转变为对应的虚拟机指令）



测试代码：

```java
public class ClassTest {

    public static void main(String[] args) {
        System.out.println("hello world");
    }
}
```



经 javac 编译后得到对应的 class 文件，然后对该文件进行反编译，得到 JVM 指令码

```java
//     =================================类的基本信息================================
Classfile /D:/IDEA_PROJECT3/jvm-demo/target/classes/com/ezreal/jvm/classfile/ClassTest.class
  Last modified 2024-2-16; size 580 bytes
  MD5 checksum 520989640ee95c3de646dfdf801f5eef
  Compiled from "ClassTest.java"
public class com.ezreal.jvm.classfile.ClassTest
  minor version: 0
  major version: 52
  flags: ACC_PUBLIC, ACC_SUPER
//     ====================================常量池=================================
Constant pool:
   #1 = Methodref          #6.#20         // java/lang/Object."<init>":()V
   #2 = Fieldref           #21.#22        // java/lang/System.out:Ljava/io/PrintStream;
   #3 = String             #23            // hello world
   #4 = Methodref          #24.#25        // java/io/PrintStream.println:(Ljava/lang/String;)V
   #5 = Class              #26            // com/ezreal/jvm/classfile/ClassTest
   #6 = Class              #27            // java/lang/Object
   #7 = Utf8               <init>
   #8 = Utf8               ()V
   #9 = Utf8               Code
  #10 = Utf8               LineNumberTable
  #11 = Utf8               LocalVariableTable
  #12 = Utf8               this
  #13 = Utf8               Lcom/ezreal/jvm/classfile/ClassTest;
  #14 = Utf8               main
  #15 = Utf8               ([Ljava/lang/String;)V
  #16 = Utf8               args
  #17 = Utf8               [Ljava/lang/String;
  #18 = Utf8               SourceFile
  #19 = Utf8               ClassTest.java
  #20 = NameAndType        #7:#8          // "<init>":()V
  #21 = Class              #28            // java/lang/System
  #22 = NameAndType        #29:#30        // out:Ljava/io/PrintStream;
  #23 = Utf8               hello world
  #24 = Class              #31            // java/io/PrintStream
  #25 = NameAndType        #32:#33        // println:(Ljava/lang/String;)V
  #26 = Utf8               com/ezreal/jvm/classfile/ClassTest
  #27 = Utf8               java/lang/Object
  #28 = Utf8               java/lang/System
  #29 = Utf8               out
  #30 = Utf8               Ljava/io/PrintStream;
  #31 = Utf8               java/io/PrintStream
  #32 = Utf8               println
  #33 = Utf8               (Ljava/lang/String;)V
//     ====================================类的方法定义（虚拟机中执行编译的方法）=================================
{
  public com.ezreal.jvm.classfile.ClassTest();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 7: 0
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       5     0  this   Lcom/ezreal/jvm/classfile/ClassTest;
 // main方法JVM指令码
  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: ACC_PUBLIC, ACC_STATIC
     // 解释器读取下面的JVM指令解释并执行
    Code:
      stack=2, locals=1, args_size=1
         0: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;
         3: ldc           #3                  // String hello world
         5: invokevirtual #4                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
         8: return
      LineNumberTable:
        line 10: 0
        line 11: 8
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       9     0  args   [Ljava/lang/String;
}
SourceFile: "ClassTest.java"

```



从上面反编译的字节码中可以看到，Class 的**常量池**其实就是一张记录着该类的一些**常量**、**方法描述**、**类描述**、**变量描述信息**的表。主要存放两类数据：

- **字面量**：比如 String 类型的字符串或者定义为 **final 类型的变量的值**；
- **符号引用**：类或接口的全限定名，变量或方法的名称，变量或方法的描述信息，this；



**常量池的作用：**

在解释器解释每条JVM指令码的时候，根据这些指令码的符号地址去常量池中找到对应的描述，然后解释器就知道执行哪个类的哪个方法、方法的参数是什么：

```java
 // main方法JVM指令码
  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: ACC_PUBLIC, ACC_STATIC
     // 解释器读取下面的JVM指令解释并执行
    Code:
      stack=2, locals=1, args_size=1
         // 从常量池中符号地址为 #2 的地方，先获取静态变量System.out
         0: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;
         // 从常量池中符号地址为 #3 的地方加载常量 hello world
         3: ldc           #3                  // String hello world
         // 从常量池中符号地址为 #3 的地方获取要执行的方法描述，并执行方法输出hello world
         5: invokevirtual #4                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
         // main方法返回
         8: return
      LineNumberTable:
        line 10: 0
        line 11: 8
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       9     0  args   [Ljava/lang/String;
```

- 当解释器解释执行 main 方法时，第3行的 JVM 指令，`0:getstatic #2`；

- `0:getstatic #2` 表示获取一个静态变量，#2 表示该静态变量的地址，然后解释器从常量池中查找 #2 对应的静态变量；
- 接着执行 `3:ldc #3` 指令，该指令的含义是从常量池中加载符号地址为 #3 的常量；
- 然后执行 `5:invokevirtual #4` ，该指令的含义是执行常量池符号地址为 #4 的方法；



#### 2.6.2 运行时常量池

当类的字节码被加载到内存中后，它的常量池信息就会集中放入到一块内存，这块内存就被称为运行时常量池，并且把里面的**符号地址**转化为**真实地址**。

- **符号地址**：从上面的反编译后的JVM字节码指令可以看到有这么一条指令`0: getstatic #2`，解释器解释执行JVM指令的时候，通过指令中的 `#x`去常量池中获取需要的值。这里的`#2`其实就是符号地址，标识这某个变量在常量池中的某个位置；
- **真实地址**：在程序运行期，当`*.Class`文件被加载到内存以后，常量池中的这些描述信息就会被**放到内存**中，其中的 `#x`会被转化为内存中的地址（真实地址）；

**直接引用和符号引用的简述：**

现在我要在A类中引用到B类，符号引用就是我只要知道B类的全类名是什么就可以了，而不用知道B类在内存中的那个具体位置（有可能B类还没有被加载进内存呢）。直接引用就相当于是一个指针，能够直接或者间接的定位到内存中的B类的具体位置。将符号引用转换为直接引用简单来说就是：在A类中可以通过使用B类的全类名转换得到B类在内存中的具体位置。





#### 2.6.3 字符串常量池

字符串常量池可以理解为运行时常量池分出来的一部分。类加载到内存的时候，字符串会存到字符串常量池里面，避免大量频繁创建字符串。


### 2.7 直接内存

直接内存并不是虚拟机运行时数据区的一部分，但是这部分内存也被频繁使用，而且也可能导致 `OutOfMemoryError` 异常出现。

在 JDK1.4 中新加入了 NIO 类，引入了一种基于通道（Channel）与缓冲区（Buffer）的 IO 方式，它可以使用 Native 函数库直接分配堆外内存，然后通过一个存储在 Java 堆里面的 DirectByteBuffer 对象作为这块内存的引用进行操作，这样可以避免在 Java 堆和 Native 堆来回复制数据。

直接内存的分配不会收到 Java 堆大小的限制，但是会收到本机总内存的限制（包括物理内存、SWAP 分区或者分页文件）大小以及处理器寻址空间的限制。如果忽略了直接内存，使得各个内存区域总和大于物理内存限制，从而导致动态扩展时出现 `OutOfMemoryError`异常。



## 三、虚拟机对象探秘

下面探讨 HotSpot 虚拟机在 Java 堆中对象**分配**、**布局**和**访问**全过程。



### 3.1 对象的创建

#### 类加载检查

对于 Java 中的对象（仅限于 Java 中的普通对象，不包括 Class 对象和数组），其创建过程为：当 Java 虚拟机遇到一条字节码 new 指令时，首先将去检查这个指令的参数是否能在**常量池（不是运行时常量池）**中定位到一个类的符号引用，并且检查这个符号引用代表的类是否已被加载、解析和初始化过。如果没有，那必须先执行相应的类加载过程。



#### 分配内存

在类加载检查通过后，接下来虚拟机将为新生对象分配内存。对象所需内存的大小在类加载完成后便可完全确定，为对象分配空间的任务实际上便等同于把一块确定大小的内存块从 Java 堆中划分出来。



#### 初始化零值

内存分配完后，虚拟机将分配到的内存空间（但不包括对象头）都初始化为零值。这步保证了对象的实例字段在 Java 代码中可以不赋初始值就直接使用，使程序能访问到这些字段的数据类型所对应的零值、



#### 执行构造函数

上面的工作都完成后，在虚拟机层面已经创建出了一个对象，但在 Java 程序层面，对象的创建才刚刚开始。在字节码指令中，new 指令之后会执行 <init>() 方法，按照程序员的意愿进行初始化，这样一个对象才真正被创建出来。



### 3.2 对象内存布局

在 HotSpot 虚拟机中，对象在堆内存中的存储布局可以划分为三个部分，**对象头**（Header），**实例数据**（Instant Data），**对齐填充**（Padding）。

#### 对象头

HotSpot 的对象头包含两类信息。

第一类是**用于存储对象自身运行的数据**，如哈希码，GC 分代年龄，锁状态标志，线程持有的锁，偏向线程 ID，偏向时间戳等，这部分数据在的长度在 32 位和 64 位的虚拟机中分别为 32bit 和 64bit，官方称它为 MarkWord。

对象头另一部分是**类型指针**，即对象**指向它的类型元数据的指针**，Java 虚拟机**通过这个指针来确定该对象是哪个类的实例**。此外，如果对象是一个 Java 数组，那在对象头中必须有一块用于记录数组长度的数据。

#### 实例数据

实例数据存储的是对象的有效信息。即我们在程序代码里面所定义的各种类型的字段内容，无论是父类继承下来的，还是子类自己定义的。

#### 对齐填充

仅仅起着占位符的作用，由于 HotSpot 虚拟机的自动内存管理系统要求对象起始地址必须是 8 字节的整数倍，换句话说任何对象的大小都必须是 8 字节的整数倍。



### 3.3 对象的定位访问

Java 程序会通过**栈**上的 reference 数据来操作**堆**上的具体对象。对象的访问方式也是由虚拟机实现而定的，主流的访问方式主要有使用句柄和直接指针两种：

- **句柄访问**：Java 堆中将可能划分出一块内存来作为句柄池，reference 中存储的就是对象的句柄对象，而句柄中包含了**对象实例数据**与**对象类型数据**各自的地址信息。

> 对象实例数据：对象的信息，对象头，实例数据，对齐填充。存储在堆中；
>
> 对象类型数据：类的元数据信息，存储在方法区中；

![对象句柄访问](https://ezreal-tuchuang-1312880100.cos.ap-guangzhou.myqcloud.com/article/image-20240128170827979.png)



- **直接指针**：reference 中存储的直接就是对象地址，如果只是访问对象本身的话，就不需要多一次间接访问的开销。HotSpot 虚拟机主要使用直接指针进行对象访问。

![直接指针访问](https://ezreal-tuchuang-1312880100.cos.ap-guangzhou.myqcloud.com/article/image-20240128173947977.png)







## 四、实战 OutOfMemoryError 异常



### 4.1 背景

- 验证各个运行时区域存储的内容；
- 根据异常信息迅速得知是哪个区域的内存溢出；



### 4.2 Java 堆溢出

Java 堆用于存储对象实例，我们只要**不断地创建对象**，并且**保证 GC Roots 到对象之间有可达路径来避免垃圾回收机制清除这些对象**，随着对象数量的增加，总容量触及最大堆的容量限制后就会产生内存溢出异常。

**代码：**

```java
/**
 * @author Ezreal
 * @Date 2024/1/28
 */
public class HeapOomTest {

    public static void main(String[] args) {

        List<OomObject> objectList = new ArrayList<>();
        while (true) {
            objectList.add(new OomObject());
        }
    }
}
```

- 添加 JVM 参数，`-Xms1m -Xmx1m`，表示最小内存为 1m，最大内存为 1m；



**现象：**

```powershell
Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
	at com.ezreal.jvm.oom.HeapOomTest.main(HeapOomTest.java:16)
```

- Java 堆内存溢出时，异常堆栈新会显示 OutOfMemoryError，进一步会显示 Java heap space



如果是**内存泄露**，可以通过工具查看泄露对象的 GC Roots 的引用链，找到泄露对象是怎样的引用路径，与哪些GC Roots 相关联，才导致垃圾收集器无法回收他们。

如果是**内存溢出**，换句话说这些对象在内存中都是存活的，那就要检查 Java 虚拟机的堆参数（-Xms 和 -Xmx）设置，与机器的内存对比，看看是否有向上调整的空间，再从代码上检查某些对象**生命周期过长**、**持有状态过长**、**存储结构不合理**等情况，尽量减少程序运行期的内存消耗。



### 4.3 Java 方法栈和本地方法栈溢出

在 HotSpot 虚拟机中并不区分虚拟机栈和本地方法栈，栈容量只能由 `-Xss` 参数设定，`-Xoss` 参数（设置本地方法栈大小）虽然存在，但实际上没有任何效果。关于虚拟机栈和本地方法栈，在《Java虚拟机规范》中描述了两种异常：

- 如果**线程请求的栈深度大于虚拟机所允许的最大深度**，将抛出 StackOverflowError 异常；
  - 使用 -Xss 参数减少栈内存容量；
  - 定义大量的本地变量，增大此方法帧中本地变量表的长度；
- 如果虚拟机的栈内存允许动态扩展，当扩展栈容量无法申请到足够的内存时，将抛出 OutOfMemoryError 异常；



**代码：**

```java
/**
 * 栈溢出
 * @author Ezreal
 * @Date 2024/1/28
 */
public class StackOomTest {

    private int length = 1;

    private void stack() {
        length++;
        stack();
    }

    public static void main(String[] args) {
        StackOomTest stackOomTest = new StackOomTest();
        try {
            stackOomTest.stack();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

- 因为线程申请的栈深度大于虚拟机允许的最大深度，从而导致 StackOverflowError；



**现象：**

```powershell
Exception in thread "main" java.lang.StackOverflowError
	at com.ezreal.jvm.oom.StackOomTest.stack(StackOomTest.java:13)
	at com.ezreal.jvm.oom.StackOomTest.stack(StackOomTest.java:14)
```



### 4.4 方法区和运行时常量池溢出

运行时常量池是方法区的一部分，在 **JDK7** 前使用 **永久代** 来实现方法区，JDK7 及 JDK7 后使用 **元空间** 来实现方法区。我们可以通过 `-XX:PermSize` 和 `-XX:MaxPermSize` 来限制永久代的大小。



String::intern 是一个本地方法，它的作用是如果**字符串常量池**中已经包含一个等于此 String 对象的字符串，则返回代表池中这个字符串的 String 对象的引用，否则，会将此 String 对象包含的字符串添加到**字符串常量池**中，并且返回此 String 对象的引用。但从 JDK7 开始，原本存放在永久代中的**字符串常量池被移至 Java 堆**中，所以在 JDK 7 及以上版本，限制方法区的容量来进行测试是毫无意义的。



我们再看看方法区其他部分的内容：方法区的主要职责是**用于存放类型的相关信息**，如**类名**，**访问修饰符**，**常量池**，**字段描述**，**方法描述**等。对于这部分的测试，基本的思路是运行时**产生大量的类去填满方法区，直到溢出为止**。下面借助 **CGLib** 直接操作字节码运行时生成了大量的动态类：



CGLib 依赖：

```xml
<dependency>
    <groupId>cglib</groupId>
    <artifactId>cglib</artifactId>
    <version>3.3.0</version>
</dependency>
```



代码：

```java
/**
 * 方法区溢出
 * @author Ezreal
 * @Date 2024/1/29
 */
public class JavaMethodAreaOOM {
    public static void main(String[] args) {
        while (true) {
            Enhancer enhancer = new Enhancer();
            enhancer.setSuperclass(OomObject.class);
            enhancer.setUseCache(false);
            enhancer.setCallback(new MethodInterceptor() {
                @Override
                public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
                    return methodProxy.invokeSuper(o, objects);
                }
            });
            enhancer.create();
        }
    }
}
```

- JDK7 及 JDK7 前的虚拟机参数：-XX:PermSize=10M -XX:MaxPermSize=10M；
- JDK8 的虚拟机参数：-XX:MetaspaceSize=10M -XX:MaxMetaspaceSize=10M；
- JDK8 使用元空间来实现常量池，JDK8 前使用永久代来实现常量池；



结果：

```powershell
Caused by: java.lang.OutOfMemoryError: Metaspace
	at java.lang.ClassLoader.defineClass1(Native Method)
	at java.lang.ClassLoader.defineClass(ClassLoader.java:756)
	... 11 more
```



### 4.5 本机直接内存溢出

直接内存（Direct Memory）的容量大小可通过 -XX:MaxDirectMemorySize 参数来指定，如果不去指定，则默认与 Java 堆最大值一致。



代码：

```java
/**
 * 直接内存溢出
 * @author Ezreal
 * @Date 2024/1/29
 */
public class DirectMemoryOOM {
    private static final int _1MB = 1024 * 1024;

    public static void main(String[] args) throws IllegalAccessException {
        Field declaredField = Unsafe.class.getDeclaredFields()[0];
        declaredField.setAccessible(true);
        Unsafe unsafe = (Unsafe) declaredField.get(null);
        while (true) {
            unsafe.allocateMemory(_1MB);
        }
    }
}
```

结果：

```powershell
Exception in thread "main" java.lang.OutOfMemoryError
	at sun.misc.Unsafe.allocateMemory(Native Method)
	at com.ezreal.jvm.oom.DirectMemoryOOM.main(DirectMemoryOOM.java:20)
```



由直接内存导致的内存溢出，一个明显的特征是在 Heap Dump 文件中不会看见有什么明显的异常情况，如果内存溢出之后产生的 Dump 文件很小，而程序中又直接或者间接使用了 DirectMemory （典型的就是 NIO），那么久可以考虑直接内存方面的原因了。



