import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CaptnsClassroom } from "../target/types/captns_classroom";
import { PublicKey } from '@solana/web3.js';
import { assert } from "chai";

const STUDENT_SEED = "NEW_STUDENT"; 

describe("captns_classroom", () => {

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CaptnsClassroom as Program<CaptnsClassroom>;

  // three students 
  const alyssa = anchor.web3.Keypair.generate();
  const marnie = anchor.web3.Keypair.generate();
  const vee = anchor.web3.Keypair.generate();

  // establish student first names
  const alyssa_firstname = "Alyssa";
  const marnie_firstname = "Marnie";
  const vee_firstname = "Vee";

  // name test cases
  const empty_name = "";
  const character_name = "🍅";
  const repeat_name = "Alyssa";

  // establish student grades
  const alyssa_midterm1 = 187.5;
  const alyssa_final1 = 100.0;
  const alyssa_homeworka1 = 73.7;
  const alyssa_homeworkb1 = 4.2;

  const alyssa_midterm2 = 57.0;
  const alyssa_final2 = 144.0;
  const alyssa_homeworka2 = 82.5;
  const alyssa_homeworkb2 = 43.2;

  const alyssa_midterm3 = 56.0;
  const alyssa_final3 = 12.0;
  const alyssa_homeworka3 = 232.5;
  const alyssa_homeworkb3 = 76.2;

  const alyssa_midterm4 = 78.0;
  const alyssa_final4 = 92.0;
  const alyssa_homeworka4 = 82.5;
  const alyssa_homeworkb4 = 231.2;

  const alyssa_midterm5 = 88.0;
  const alyssa_final5 = 92.0;
  const alyssa_homeworka5 = 82.5;
  const alyssa_homeworkb5 = 43.2;

  const marnie_midterm1 = 3.5;
  const marnie_final1 = 78.0;
  const marnie_homeworka1 = 100.0;
  const marnie_homeworkb1 = 89.2;

  const vee_midterm = 56.5;
  const vee_final = 78.0;
  const vee_homeworka = 99.7;
  const vee_homeworkb = 89.2;

  describe("Create students", () => {
    it("1) Should properly create student", async () => {
      await airdrop(provider.connection, alyssa.publicKey);
      const [student_pkey, bump] = getStudentAcctAddress(
        alyssa_firstname,
        alyssa.publicKey,
        program.programId
      );

      await program.methods
        .createStudent(alyssa_firstname)
        .accounts({
          studentIdentifier: alyssa.publicKey,
        })
        .signers([alyssa])
        .rpc({ commitment: "confirmed" });

      const studentData = await program.account.student.fetch(student_pkey);
      assert.strictEqual(studentData.firstName, alyssa_firstname);
      assert.strictEqual(studentData.studentId.toString(), alyssa.publicKey.toString());
    });

    it("2) Should not allow the same student to be created twice", async () => {
      let threw = false;
      try {
        await program.methods
          .createStudent(repeat_name) // "Alyssa" again
          .accounts({
            studentIdentifier: alyssa.publicKey,
          })
          .signers([alyssa])
          .rpc({ commitment: "confirmed" });
      } catch (err) {
        threw = true;
      }
      assert.isTrue(threw, "Duplicate student creation should throw");
    });

    it("3) Should not allow a name past the maximum allowed characters", async () => {
      const longName = "X".repeat(40); // adjust if your program enforces max length
      const tmpStudent = anchor.web3.Keypair.generate();
      await airdrop(provider.connection, tmpStudent.publicKey);

      let threw = false;
      try {
        await program.methods
          .createStudent(longName)
          .accounts({
            studentIdentifier: tmpStudent.publicKey,
          })
          .signers([tmpStudent])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Should reject names longer than allowed");
    });

    it("4) Should not allow a name with any special characters", async () => {
      const tmpStudent = anchor.web3.Keypair.generate();
      await airdrop(provider.connection, tmpStudent.publicKey);

      let threw = false;
      try {
        await program.methods
          .createStudent(character_name) // 🍅
          .accounts({
            studentIdentifier: tmpStudent.publicKey,
          })
          .signers([tmpStudent])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Should reject special character names");
    });

    it("5) Should not allow a student to create an account more than once", async () => {
      let threw = false;
      try {
        await program.methods
          .createStudent(alyssa_firstname)
          .accounts({
            studentIdentifier: alyssa.publicKey,
          })
          .signers([alyssa])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Same student wallet should not be able to create twice");
    });

    it("6) Should allow multiple students to create accounts", async () => {
      await airdrop(provider.connection, marnie.publicKey);
      await airdrop(provider.connection, vee.publicKey);

      const [marnie_pda] = getStudentAcctAddress(marnie_firstname, marnie.publicKey, program.programId);
      const [vee_pda] = getStudentAcctAddress(vee_firstname, vee.publicKey, program.programId);

      await program.methods
        .createStudent(marnie_firstname)
        .accounts({ studentIdentifier: marnie.publicKey })
        .signers([marnie])
        .rpc({ commitment: "confirmed" });

      await program.methods
        .createStudent(vee_firstname)
        .accounts({ studentIdentifier: vee.publicKey })
        .signers([vee])
        .rpc({ commitment: "confirmed" });

      const marnieData = await program.account.student.fetch(marnie_pda);
      const veeData = await program.account.student.fetch(vee_pda);

      assert.strictEqual(marnieData.firstName, marnie_firstname);
      assert.strictEqual(veeData.firstName, vee_firstname);
    });

    it("7) Should not allow a student to create an account with no characters", async () => {
      const tmpStudent = anchor.web3.Keypair.generate();
      await airdrop(provider.connection, tmpStudent.publicKey);

      let threw = false;
      try {
        await program.methods
          .createStudent(empty_name)
          .accounts({
            studentIdentifier: tmpStudent.publicKey,
          })
          .signers([tmpStudent])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Should reject empty names");
    });
  });

  describe("Delete students", () => {
    it("1) Should fail when removing non-existent student", async () => {
      const ghost = anchor.web3.Keypair.generate();
      await airdrop(provider.connection, ghost.publicKey);

      const ghost_name = "Ghost";

      let threw = false;
      try {
        await program.methods
          .deleteStudent(ghost_name)
          .accounts({
            studentIdentifier: ghost.publicKey,
          })
          .signers([ghost])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Deleting a non-existent student should fail");
    });

    it("2) Should only allow student to close their own account", async () => {
      await airdrop(provider.connection, alyssa.publicKey);
      const [alyssa_pda] = getStudentAcctAddress(
        alyssa_firstname,
        alyssa.publicKey,
        program.programId
      );
      try {
        await program.account.student.fetch(alyssa_pda);
      } catch {
        await program.methods
          .createStudent(alyssa_firstname)
          .accounts({ studentIdentifier: alyssa.publicKey })
          .signers([alyssa])
          .rpc({ commitment: "confirmed" });
      }

      await airdrop(provider.connection, marnie.publicKey);
      let threw = false;
      try {
        await program.methods
          .deleteStudent(alyssa_firstname)
          .accounts({
            studentIdentifier: alyssa.publicKey,
          })
          .signers([marnie])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Only the student should be able to close their own account");
    });

    it("3) Should successfully close account", async () => {
      await airdrop(provider.connection, alyssa.publicKey);
      const [alyssa_pda] = getStudentAcctAddress(
        alyssa_firstname,
        alyssa.publicKey,
        program.programId
      );
      let exists = true;
      try {
        await program.account.student.fetch(alyssa_pda);
      } catch {
        exists = false;
      }
      if (!exists) {
        await program.methods
          .createStudent(alyssa_firstname)
          .accounts({ studentIdentifier: alyssa.publicKey })
          .signers([alyssa])
          .rpc({ commitment: "confirmed" });
      }

      await program.methods
        .deleteStudent(alyssa_firstname)
        .accounts({ studentIdentifier: alyssa.publicKey })
        .signers([alyssa])
        .rpc({ commitment: "confirmed" });

      let fetchThrew = false;
      try {
        await program.account.student.fetch(alyssa_pda);
      } catch {
        fetchThrew = true;
      }
      assert.isTrue(fetchThrew, "Student account should be closed and no longer fetchable");
    });

    it("4) Should allow student to create another submission after closing", async () => {
      await airdrop(provider.connection, alyssa.publicKey);

      const [new_pda] = getStudentAcctAddress(
        alyssa_firstname,
        alyssa.publicKey,
        program.programId
      );

      await program.methods
        .createStudent(alyssa_firstname)
        .accounts({ studentIdentifier: alyssa.publicKey })
        .signers([alyssa])
        .rpc({ commitment: "confirmed" });

      const studentData = await program.account.student.fetch(new_pda);
      assert.strictEqual(studentData.firstName, alyssa_firstname);
      assert.strictEqual(studentData.studentId.toString(), alyssa.publicKey.toString());
    });
  });

  describe("Submit grades", () => {
    it("1) Should fail if all grades are not submitted", async () => {
      await airdrop(provider.connection, alyssa.publicKey);
      const [alyssa_pda] = getStudentAcctAddress(alyssa_firstname, alyssa.publicKey, program.programId);

      try { await program.account.student.fetch(alyssa_pda); }
      catch {
        await program.methods
          .createStudent(alyssa_firstname)
          .accounts({ studentIdentifier: alyssa.publicKey })
          .signers([alyssa])
          .rpc({ commitment: "confirmed" });
      }

      let threw = false;
      try {
        await program.methods
          .submitGrades(
            alyssa_midterm1,
            null as any,              // intentionally missing final
            alyssa_homeworka1,
            alyssa_homeworkb1
          )
          .accounts({ submitter: alyssa.publicKey })
          .signers([alyssa])
          .rpc({ commitment: "confirmed" });
      } catch { threw = true; }
      assert.isTrue(threw, "Submitting without all grade fields should fail");
    });

    it("2) Should successfully create grades", async () => {
      await airdrop(provider.connection, alyssa.publicKey);
      const [alyssa_pda] = getStudentAcctAddress(alyssa_firstname, alyssa.publicKey, program.programId);

      try { await program.account.student.fetch(alyssa_pda); }
      catch {
        await program.methods
          .createStudent(alyssa_firstname)
          .accounts({ studentIdentifier: alyssa.publicKey })
          .signers([alyssa])
          .rpc({ commitment: "confirmed" });
      }

      await program.methods
        .submitGrades(
          alyssa_midterm1,
          alyssa_final1,
          alyssa_homeworka1,
          alyssa_homeworkb1
        )
        .accounts({ submitter: alyssa.publicKey })
        .signers([alyssa])
        .rpc({ commitment: "confirmed" });

      const s = await program.account.student.fetch(alyssa_pda);
      assert.strictEqual(s.firstName, alyssa_firstname);
      assert.strictEqual(s.studentId.toString(), alyssa.publicKey.toString());
      assert.strictEqual(Number(s.finalGrade), alyssa_final1);
    });

    it("3) Should successfully and accurately update final grade (via re-submission)", async () => {
      await airdrop(provider.connection, alyssa.publicKey);
      const [alyssa_pda] = getStudentAcctAddress(alyssa_firstname, alyssa.publicKey, program.programId);

      try { await program.account.student.fetch(alyssa_pda); }
      catch {
        await program.methods
          .createStudent(alyssa_firstname)
          .accounts({ studentIdentifier: alyssa.publicKey })
          .signers([alyssa])
          .rpc({ commitment: "confirmed" });
      }

      await program.methods
        .submitGrades(
          alyssa_midterm2,
          alyssa_final2,
          alyssa_homeworka2,
          alyssa_homeworkb2
        )
        .accounts({ submitter: alyssa.publicKey })
        .signers([alyssa])
        .rpc({ commitment: "confirmed" });

      await program.methods
        .submitGrades(
          alyssa_midterm2,          // unchanged midterm
          alyssa_final3,            // new final
          alyssa_homeworka2,        // unchanged homework
          alyssa_homeworkb2
        )
        .accounts({ submitter: alyssa.publicKey })
        .signers([alyssa])
        .rpc({ commitment: "confirmed" });

      const s1 = await program.account.student.fetch(alyssa_pda);
      assert.strictEqual(Number(s1.finalGrade), alyssa_final3);
    });

    it("4) Should only allow student to update final grade (re-submission must be by owner)", async () => {
      await airdrop(provider.connection, alyssa.publicKey);
      await airdrop(provider.connection, marnie.publicKey);

      const [alyssa_pda] = getStudentAcctAddress(alyssa_firstname, alyssa.publicKey, program.programId);
      try { await program.account.student.fetch(alyssa_pda); }
      catch {
        await program.methods
          .createStudent(alyssa_firstname)
          .accounts({ studentIdentifier: alyssa.publicKey })
          .signers([alyssa])
          .rpc({ commitment: "confirmed" });
      }

      await program.methods
        .submitGrades(
          alyssa_midterm3,
          alyssa_final3,
          alyssa_homeworka3,
          alyssa_homeworkb3
        )
        .accounts({ submitter: alyssa.publicKey })
        .signers([alyssa])
        .rpc({ commitment: "confirmed" });

      let threw = false;
      try {
        await program.methods
          .submitGrades(
            alyssa_midterm3,
            alyssa_final4,          // attempt to change final
            alyssa_homeworka3,
            alyssa_homeworkb3
          )
          .accounts({ submitter: alyssa.publicKey }) // still Alyssa's account
          .signers([marnie])                         // signed by Marnie → should fail
          .rpc({ commitment: "confirmed" });
      } catch { threw = true; }
      assert.isTrue(threw, "Only the owning student should be able to update their grades");
    });

    it("5) Should not allow a grade higher than 100 (create and update via submitGrades)", async () => {
      await airdrop(provider.connection, vee.publicKey);

      const [vee_pda] = getStudentAcctAddress(vee_firstname, vee.publicKey, program.programId);
      try { await program.account.student.fetch(vee_pda); }
      catch {
        await program.methods
          .createStudent(vee_firstname)
          .accounts({ studentIdentifier: vee.publicKey })
          .signers([vee])
          .rpc({ commitment: "confirmed" });
      }

      let threwSubmit = false;
      try {
        await program.methods
          .submitGrades(vee_midterm, 101.0, vee_homeworka, vee_homeworkb)
          .accounts({ submitter: vee.publicKey })
          .signers([vee])
          .rpc({ commitment: "confirmed" });
      } catch { threwSubmit = true; }
      assert.isTrue(threwSubmit, "Final grade > 100 should be rejected");

      await program.methods
        .submitGrades(vee_midterm, vee_final, vee_homeworka, vee_homeworkb)
        .accounts({ submitter: vee.publicKey })
        .signers([vee])
        .rpc({ commitment: "confirmed" });

      let threwUpdate = false;
      try {
        await program.methods
          .submitGrades(vee_midterm, 100.1, vee_homeworka, vee_homeworkb)
          .accounts({ submitter: vee.publicKey })
          .signers([vee])
          .rpc({ commitment: "confirmed" });
      } catch { threwUpdate = true; }
      assert.isTrue(threwUpdate, "Updating to > 100 should be rejected");
    });

    it("6) Should not allow a grade lower than 5 (create and update via submitGrades)", async () => {
      await airdrop(provider.connection, marnie.publicKey);

      const [marnie_pda] = getStudentAcctAddress(marnie_firstname, marnie.publicKey, program.programId);
      try { await program.account.student.fetch(marnie_pda); }
      catch {
        await program.methods
          .createStudent(marnie_firstname)
          .accounts({ studentIdentifier: marnie.publicKey })
          .signers([marnie])
          .rpc({ commitment: "confirmed" });
      }

      let threwSubmit = false;
      try {
        await program.methods
          .submitGrades(marnie_midterm1, 4.9, marnie_homeworka1, marnie_homeworkb1)
          .accounts({ submitter: marnie.publicKey })
          .signers([marnie])
          .rpc({ commitment: "confirmed" });
      } catch { threwSubmit = true; }
      assert.isTrue(threwSubmit, "Final grade < 5 should be rejected");

      await program.methods
        .submitGrades(marnie_midterm1, marnie_final1, marnie_homeworka1, marnie_homeworkb1)
        .accounts({ submitter: marnie.publicKey })
        .signers([marnie])
        .rpc({ commitment: "confirmed" });

      let threwUpdate = false;
      try {
        await program.methods
          .submitGrades(marnie_midterm1, 0.0, marnie_homeworka1, marnie_homeworkb1)
          .accounts({ submitter: marnie.publicKey })
          .signers([marnie])
          .rpc({ commitment: "confirmed" });
      } catch { threwUpdate = true; }
      assert.isTrue(threwUpdate, "Updating to < 5 should be rejected");
    });

    it("7) Should update on re-submission (no duplicate account)", async () => {
      await airdrop(provider.connection, alyssa.publicKey);
      const [alyssa_pda] = getStudentAcctAddress(alyssa_firstname, alyssa.publicKey, program.programId);

      try { await program.account.student.fetch(alyssa_pda); }
      catch {
        await program.methods
          .createStudent(alyssa_firstname)
          .accounts({ studentIdentifier: alyssa.publicKey })
          .signers([alyssa])
          .rpc({ commitment: "confirmed" });
      }

      await program.methods
        .submitGrades(
          alyssa_midterm5,
          alyssa_final5,
          alyssa_homeworka5,
          alyssa_homeworkb5
        )
        .accounts({ submitter: alyssa.publicKey })
        .signers([alyssa])
        .rpc({ commitment: "confirmed" });

      await program.methods
        .submitGrades(
          alyssa_midterm4,
          alyssa_final4,
          alyssa_homeworka4,
          alyssa_homeworkb4
        )
        .accounts({ submitter: alyssa.publicKey })
        .signers([alyssa])
        .rpc({ commitment: "confirmed" });

      const s = await program.account.student.fetch(alyssa_pda);
      assert.strictEqual(Number(s.finalGrade), alyssa_final4); // updated
    });
  });
});

async function airdrop(connection: any, address: any, amount = 1000000000) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}

function getStudentAcctAddress(first_name: string, student: PublicKey, programID: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(first_name),
      anchor.utils.bytes.utf8.encode(STUDENT_SEED),
      student.toBuffer(),
    ],
    programID
  );
}
